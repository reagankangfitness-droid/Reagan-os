"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useHabits } from "@/lib/hooks";
import { HABITS, HabitDay, HabitKey } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const HABIT_COLOR_MAP: Record<string, string> = {
  blue: "#378ADD",
  green: "#22c55e",
  amber: "#f59e0b",
};

const HABIT_BG_MAP: Record<string, string> = {
  blue: "rgba(55, 138, 221, 0.1)",
  green: "rgba(34, 197, 94, 0.1)",
  amber: "rgba(245, 158, 11, 0.1)",
};

function ProgressRing({
  percent,
  size = 120,
  stroke = 8,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#378ADD"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}

export default function TodayTab() {
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateStr(today);
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat

  const { data: habitDay, save, isLoading } = useHabits(todayStr);
  const [streak, setStreak] = useState(0);

  // Determine which habits are active today
  const activeHabits = useMemo(
    () =>
      HABITS.filter((h) => h.daily || h.dayOnly === dayOfWeek),
    [dayOfWeek]
  );

  // Default habits state
  const habits = useMemo(() => habitDay?.habits ?? {
    content: false,
    saas_task: false,
    outreach: false,
    batch_content: false,
    review_metrics: false,
    saas_focus: false,
  }, [habitDay?.habits]);

  // Completion calculation based on active habits only
  const activeCompleted = activeHabits.filter(
    (h) => habits[h.key]
  ).length;
  const activeTotal = activeHabits.length;
  const completionPercent =
    activeTotal > 0 ? Math.round((activeCompleted / activeTotal) * 100) : 0;
  const allDone = activeCompleted === activeTotal && activeTotal > 0;

  // Toggle a habit
  const toggleHabit = useCallback(
    (key: HabitKey) => {
      const updated: HabitDay = {
        date: todayStr,
        habits: { ...habits, [key]: !habits[key] },
      };
      save(updated);
    },
    [habits, todayStr, save]
  );

  // Calculate streak: fetch last 30 days and count consecutive completed days backwards from yesterday
  useEffect(() => {
    async function calcStreak() {
      const dates: string[] = [];
      for (let i = 1; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(toDateStr(d));
      }

      try {
        const results = await Promise.all(
          dates.map((date) =>
            fetch(`/api/habits?date=${date}`)
              .then((r) => r.json())
              .then((data: HabitDay | null) => ({ date, data }))
              .catch(() => ({ date, data: null }))
          )
        );

        let count = 0;
        for (const { date, data } of results) {
          if (!data?.habits) break;

          const d = new Date(date + "T12:00:00");
          const dow = d.getDay();

          // Get active habits for that day
          const dayActive = HABITS.filter(
            (h) => h.daily || h.dayOnly === dow
          );
          const allCompleted = dayActive.every((h) => data.habits[h.key]);

          if (allCompleted && dayActive.length > 0) {
            count++;
          } else {
            break;
          }
        }
        setStreak(count);
      } catch {
        setStreak(0);
      }
    }

    calcStreak();
  }, [today]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Identity Statement */}
      <p className="text-center text-white/60 text-sm tracking-wide uppercase">
        I am a fitness entrepreneur who creates every single day.
      </p>

      {/* Date + Streak */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">{formatDate(today)}</h1>
        <p className="text-[#378ADD] font-semibold text-lg">
          {streak > 0 ? `${streak}-day streak` : "Start your streak today"}
        </p>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <ProgressRing percent={completionPercent} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {completionPercent}%
            </span>
          </div>
        </div>
        <p className="text-white/50 text-sm">
          {activeCompleted}/{activeTotal} habits done
        </p>
      </div>

      {/* Habit Checklist */}
      <div className="space-y-2">
        {HABITS.map((habit) => {
          const isActive = habit.daily || habit.dayOnly === dayOfWeek;
          const color = HABIT_COLOR_MAP[habit.color];
          const bg = HABIT_BG_MAP[habit.color];

          return (
            <div
              key={habit.key}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? "opacity-100"
                  : "opacity-30 pointer-events-none"
              }`}
              style={{
                backgroundColor: isActive
                  ? habits[habit.key]
                    ? bg
                    : "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.02)",
              }}
            >
              <Checkbox
                checked={habits[habit.key]}
                onCheckedChange={() => toggleHabit(habit.key)}
                disabled={!isActive || isLoading}
                className="border-white/30 data-checked:border-transparent"
                style={{
                  ...(habits[habit.key]
                    ? { backgroundColor: color, borderColor: color }
                    : {}),
                }}
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    habits[habit.key] ? "line-through text-white/50" : "text-white"
                  }`}
                >
                  {habit.label}
                </span>
                {!habit.daily && (
                  <span
                    className="ml-2 text-xs px-1.5 py-0.5 rounded"
                    style={{ color, backgroundColor: bg }}
                  >
                    {habit.dayOnly === 0
                      ? "Sun"
                      : habit.dayOnly === 5
                        ? "Fri"
                        : "Sat"}{" "}
                    only
                  </span>
                )}
              </div>
              {habits[habit.key] && (
                <span style={{ color }} className="text-xs font-medium">
                  Done
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational note when all done */}
      {allDone && (
        <div className="text-center py-4 px-6 rounded-xl bg-[#378ADD]/10 border border-[#378ADD]/20">
          <p className="text-[#378ADD] font-bold text-lg">
            Don&apos;t break the chain!
          </p>
          <p className="text-white/50 text-sm mt-1">
            All habits completed. Keep the momentum going tomorrow.
          </p>
        </div>
      )}
    </div>
  );
}
