"use client";

import { useEffect, useState, useMemo } from "react";
import { HABITS, HabitDay, HabitKey } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HABIT_COLOR_MAP: Record<string, string> = {
  blue: "#378ADD",
  green: "#22c55e",
  amber: "#f59e0b",
};

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// Map our Mon-Sun index (0-6) to JS getDay() (0=Sun..6=Sat)
function weekIndexToDow(idx: number): number {
  // idx 0=Mon(1), 1=Tue(2)... 5=Sat(6), 6=Sun(0)
  return idx === 6 ? 0 : idx + 1;
}

function isHabitActiveOnDay(
  habit: (typeof HABITS)[number],
  dow: number
): boolean {
  return habit.daily || habit.dayOnly === dow;
}

interface WeekData {
  [dateStr: string]: HabitDay | null;
}

export default function ScorecardTab() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState<WeekData>({});
  const [loading, setLoading] = useState(true);

  const monday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(monday), [monday]);
  const weekDateStrs = useMemo(
    () => weekDates.map((d) => toDateStr(d)),
    [weekDates]
  );

  // Fetch all 7 days at once
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchWeek() {
      try {
        const results = await Promise.all(
          weekDateStrs.map((date) =>
            fetch(`/api/habits?date=${date}`)
              .then((r) => r.json())
              .then((data: HabitDay) => ({ date, data }))
              .catch(() => ({ date, data: null }))
          )
        );

        if (cancelled) return;

        const map: WeekData = {};
        for (const { date, data } of results) {
          map[date] = data;
        }
        setWeekData(map);
      } catch {
        if (!cancelled) setWeekData({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeek();
    return () => {
      cancelled = true;
    };
  }, [weekDateStrs]);

  // Calculate streaks per habit within this week
  function habitWeekStreak(key: HabitKey): number {
    const habit = HABITS.find((h) => h.key === key)!;
    let streak = 0;
    // Count from end of week backwards
    for (let i = 6; i >= 0; i--) {
      const dateStr = weekDateStrs[i];
      const dow = weekIndexToDow(i);
      if (!isHabitActiveOnDay(habit, dow)) continue;

      const day = weekData[dateStr];
      if (day?.habits?.[key]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // Summary stats
  const stats = useMemo(() => {
    let totalActive = 0;
    let totalCompleted = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Go through each day Mon-Sun
    for (let i = 0; i < 7; i++) {
      const dateStr = weekDateStrs[i];
      const dow = weekIndexToDow(i);
      const day = weekData[dateStr];

      const dayActive = HABITS.filter((h) => isHabitActiveOnDay(h, dow));
      const dayCompleted = dayActive.filter(
        (h) => day?.habits?.[h.key]
      ).length;

      totalActive += dayActive.length;
      totalCompleted += dayCompleted;

      // Day-level streak (all active habits done)
      if (dayCompleted === dayActive.length && dayActive.length > 0) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current streak = count from last day backwards
    currentStreak = 0;
    for (let i = 6; i >= 0; i--) {
      const dateStr = weekDateStrs[i];
      const dow = weekIndexToDow(i);
      const day = weekData[dateStr];
      const dayActive = HABITS.filter((h) => isHabitActiveOnDay(h, dow));
      const dayCompleted = dayActive.filter(
        (h) => day?.habits?.[h.key]
      ).length;

      if (dayCompleted === dayActive.length && dayActive.length > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const completionRate =
      totalActive > 0 ? Math.round((totalCompleted / totalActive) * 100) : 0;

    return { currentStreak, bestStreak, completionRate };
  }, [weekData, weekDateStrs]);

  const weekLabel = monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">
            Week of {weekLabel}
          </h2>
          {weekOffset === 0 && (
            <span className="text-xs text-[#378ADD]">Current week</span>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={weekOffset >= 0}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white/5 border-0 ring-0">
          <CardContent className="text-center py-3">
            <p className="text-2xl font-bold text-[#378ADD]">
              {stats.currentStreak}
            </p>
            <p className="text-xs text-white/50">Current Streak</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-0 ring-0">
          <CardContent className="text-center py-3">
            <p className="text-2xl font-bold text-[#22c55e]">
              {stats.bestStreak}
            </p>
            <p className="text-xs text-white/50">Best Streak</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-0 ring-0">
          <CardContent className="text-center py-3">
            <p className="text-2xl font-bold text-[#f59e0b]">
              {stats.completionRate}%
            </p>
            <p className="text-xs text-white/50">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Habit Grid */}
      <Card className="bg-white/5 border-0 ring-0 overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-white">Weekly Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-white/40 py-8">Loading...</div>
          ) : (
            <div className="min-w-[480px]">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_repeat(7,40px)_48px] gap-1 mb-2">
                <div /> {/* spacer for habit label column */}
                {DAY_LABELS.map((day, i) => {
                  const dateStr = weekDateStrs[i];
                  const dayNum = new Date(dateStr + "T12:00:00").getDate();
                  return (
                    <div
                      key={day}
                      className="text-center text-xs text-white/50"
                    >
                      <div>{day}</div>
                      <div className="text-white/30">{dayNum}</div>
                    </div>
                  );
                })}
                <div className="text-center text-xs text-white/50">Streak</div>
              </div>

              {/* Habit rows */}
              {HABITS.map((habit) => {
                const color = HABIT_COLOR_MAP[habit.color];
                const wStreak = habitWeekStreak(habit.key);

                return (
                  <div
                    key={habit.key}
                    className="grid grid-cols-[1fr_repeat(7,40px)_48px] gap-1 items-center py-1.5 border-t border-white/5"
                  >
                    {/* Habit label */}
                    <div className="text-xs text-white/80 truncate pr-2">
                      {habit.label.length > 28
                        ? habit.label.slice(0, 28) + "..."
                        : habit.label}
                    </div>

                    {/* Day cells */}
                    {weekDateStrs.map((dateStr, dayIdx) => {
                      const dow = weekIndexToDow(dayIdx);
                      const active = isHabitActiveOnDay(habit, dow);
                      const day = weekData[dateStr];
                      const done = day?.habits?.[habit.key] ?? false;

                      if (!active) {
                        return (
                          <div
                            key={dateStr}
                            className="flex items-center justify-center"
                          >
                            <div className="w-7 h-7 rounded-md bg-white/[0.02] flex items-center justify-center">
                              <span className="text-[10px] text-white/15">
                                N/A
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={dateStr}
                          className="flex items-center justify-center"
                        >
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: done
                                ? color
                                : "rgba(255,255,255,0.05)",
                              border: done
                                ? "none"
                                : `1px solid ${color}33`,
                            }}
                          >
                            {done && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Streak */}
                    <div className="text-center">
                      <span
                        className="text-xs font-semibold"
                        style={{ color }}
                      >
                        {wStreak > 0 ? wStreak : "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
