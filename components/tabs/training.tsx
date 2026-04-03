"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useTrainingConfig,
  useBiometrics,
} from "@/lib/hooks";
import {
  SessionType,
  SESSION_COLORS,
  WEEKLY_SCHEDULE,
  PHASES,
  BODY_COMP_CHECKPOINTS,
  BiometricCheckin,
  SessionLog,
  PhaseInfo,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Helpers ───────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMondayOfWeek(startDate: Date, weekNum: number): Date {
  // startDate is week 1 Monday (or closest Monday)
  const d = new Date(startDate);
  d.setDate(d.getDate() + (weekNum - 1) * 7);
  return d;
}

function getSundayOfWeek(startDate: Date, weekNum: number): Date {
  const mon = getMondayOfWeek(startDate, weekNum);
  return addDays(mon, 6);
}

function getPhase(week: number): PhaseInfo {
  if (week <= 4) return PHASES[0];
  if (week <= 9) return PHASES[1];
  return PHASES[2];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const METRIC_LABELS: Record<SessionType, string> = {
  FF: "Rounds/reps or time",
  HX: "Total time or sim distance",
  LIFT: "Top weight hit",
  MOB: "Duration (min)",
  GYM: "Skill notes",
  REST: "",
};

const PHASE_BADGE_COLORS = ["#3ab87a", "#3ab8d0", "#e06050"] as const;

// ─── Sub-components ────────────────────────────────────────

function SessionBadge({
  type,
  label,
  done,
  onClick,
}: {
  type: SessionType;
  label: string;
  done?: boolean;
  onClick?: () => void;
}) {
  const color = SESSION_COLORS[type];
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all hover:brightness-125 cursor-pointer border"
      style={{
        backgroundColor: done ? `${color}33` : `${color}15`,
        borderColor: done ? color : `${color}44`,
        color: done ? "#fff" : color,
        textDecoration: done ? undefined : undefined,
      }}
    >
      <span className="block truncate">{label}</span>
      {done && <span className="text-[10px] opacity-70">✓ done</span>}
    </button>
  );
}

function AlertBanner({
  text,
  severity,
}: {
  text: string;
  severity: "red" | "amber";
}) {
  const bg = severity === "red" ? "rgba(224,96,80,0.15)" : "rgba(232,160,48,0.15)";
  const border = severity === "red" ? "#e06050" : "#e8a030";
  const textColor = severity === "red" ? "#ff8a7a" : "#ffc870";
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm font-medium mb-2"
      style={{ backgroundColor: bg, borderLeft: `4px solid ${border}`, color: textColor }}
    >
      {text}
    </div>
  );
}

// ─── Session Edit Dialog ───────────────────────────────────

function SessionEditDialog({
  open,
  onClose,
  type,
  label,
  sessionData,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  sessionKey?: string;
  type: SessionType;
  label: string;
  sessionData: { done: boolean; notes: string; metric: string };
  onSave: (data: { done: boolean; notes: string; metric: string }) => void;
}) {
  const [done, setDone] = useState(sessionData.done);
  const [notes, setNotes] = useState(sessionData.notes);
  const [metric, setMetric] = useState(sessionData.metric);

  useEffect(() => {
    setDone(sessionData.done);
    setNotes(sessionData.notes);
    setMetric(sessionData.metric);
  }, [sessionData]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: SESSION_COLORS[type] }}
            />
            {label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3">
            <Button
              variant={done ? "default" : "outline"}
              size="sm"
              onClick={() => setDone(!done)}
              className={done ? "bg-green-600 hover:bg-green-700 text-white" : "border-white/20 text-white/70"}
            >
              {done ? "✓ Done" : "Mark Done"}
            </Button>
          </div>

          {type !== "REST" && (
            <div>
              <label className="text-xs text-white/50 mb-1 block">
                {METRIC_LABELS[type]}
              </label>
              <Input
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder={METRIC_LABELS[type]}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-white/50 mb-1 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Session notes..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
            />
          </div>

          <Button
            onClick={() => {
              onSave({ done, notes, metric });
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Body Composition SVG ──────────────────────────────────

function BodyCompChart({
  currentWeight,
  currentWeek,
}: {
  currentWeight: number | null;
  currentWeek: number;
  phase?: number;
}) {
  const W = 600;
  const H = 200;
  const padX = 50;
  const padY = 30;

  const minW = 91;
  const maxW = 102;

  const xScale = (week: number) => padX + (week / 13) * (W - padX * 2);
  const yScale = (weight: number) =>
    padY + ((maxW - weight) / (maxW - minW)) * (H - padY * 2);

  const points = BODY_COMP_CHECKPOINTS.map((cp) => ({
    x: xScale(cp.week),
    y: yScale(cp.weight),
    ...cp,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const userX = xScale(currentWeek);
  const userY = currentWeight ? yScale(currentWeight) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Grid lines */}
      {[92, 94, 96, 98, 100].map((w) => (
        <g key={w}>
          <line
            x1={padX}
            y1={yScale(w)}
            x2={W - padX}
            y2={yScale(w)}
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="4,4"
          />
          <text x={padX - 8} y={yScale(w) + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10}>
            {w}kg
          </text>
        </g>
      ))}

      {/* Target path */}
      <path d={pathD} fill="none" stroke="#3ab8d0" strokeWidth={2} strokeDasharray="6,3" />

      {/* Checkpoints */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill="#1a1a2e" stroke="#3ab8d0" strokeWidth={2} />
          <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#3ab8d0" fontSize={10} fontWeight={600}>
            {p.label}
          </text>
          <text x={p.x} y={p.y + 18} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>
            {p.weight}kg / {p.bf}%
          </text>
        </g>
      ))}

      {/* Current weight dot */}
      {currentWeight && userY !== null && (
        <g>
          <circle cx={userX} cy={userY} r={7} fill="#e8a030" stroke="#fff" strokeWidth={2} />
          <text x={userX} y={userY - 14} textAnchor="middle" fill="#e8a030" fontSize={11} fontWeight={700}>
            {currentWeight}kg
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────

export default function TrainingTab() {
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateStr(today);
  const isSunday = today.getDay() === 0;

  // ── Config ──
  const { data: config, save: saveConfig, isLoading: configLoading } = useTrainingConfig();
  const [startDateInput, setStartDateInput] = useState("");

  // ── Week navigation ──
  const [weekOffset, setWeekOffset] = useState(0);

  const startDate = useMemo(() => {
    if (!config?.start_date) return null;
    return new Date(config.start_date + "T00:00:00");
  }, [config?.start_date]);

  const naturalWeek = useMemo(() => {
    if (!startDate) return 1;
    const diff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
    return Math.max(1, Math.min(13, diff));
  }, [startDate, today]);

  const currentWeek = useMemo(() => {
    const base = config?.current_week_override ?? naturalWeek;
    const adjusted = base + weekOffset;
    return Math.max(1, Math.min(13, adjusted));
  }, [config?.current_week_override, naturalWeek, weekOffset]);

  const phase = useMemo(() => getPhase(currentWeek), [currentWeek]);

  // ── Week dates ──
  const weekDates = useMemo(() => {
    if (!startDate) return DAYS.map(() => "");
    const mon = getMondayOfWeek(startDate, currentWeek);
    return DAYS.map((_, i) => toDateStr(addDays(mon, i)));
  }, [startDate, currentWeek]);

  const sundayDateStr = weekDates[6] || "";

  // ── Session data (all 7 days) ──
  const [weekSessions, setWeekSessions] = useState<Record<string, SessionLog>>({});
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (!weekDates[0] || weekDates[0] === "") return;
    setSessionsLoading(true);

    Promise.all(
      weekDates.map((date) =>
        fetch(`/api/training/sessions?date=${date}`)
          .then((r) => r.json())
          .then((data: SessionLog | null) => ({
            date,
            log: data || { date, sessions: {}, protein_hit: false },
          }))
      )
    )
      .then((results) => {
        const map: Record<string, SessionLog> = {};
        results.forEach((r) => {
          map[r.date] = r.log;
        });
        setWeekSessions(map);
      })
      .finally(() => setSessionsLoading(false));
  }, [weekDates]);

  // ── Biometrics ──
  const { data: biometrics, save: saveBiometrics } = useBiometrics(sundayDateStr);

  // Previous week biometrics for alerts
  const prevSundayStr = useMemo(() => {
    if (!startDate || currentWeek <= 1) return "";
    return toDateStr(getSundayOfWeek(startDate, currentWeek - 1));
  }, [startDate, currentWeek]);

  const { data: prevBiometrics } = useBiometrics(prevSundayStr);

  // Two weeks ago biometrics
  const prevPrevSundayStr = useMemo(() => {
    if (!startDate || currentWeek <= 2) return "";
    return toDateStr(getSundayOfWeek(startDate, currentWeek - 2));
  }, [startDate, currentWeek]);

  const { data: prevPrevBiometrics } = useBiometrics(prevPrevSundayStr);

  // ── Biometric form state ──
  const [bioForm, setBioForm] = useState<BiometricCheckin>({
    date: sundayDateStr,
    avg_weight: 0,
    resting_hr: 0,
    energy: 5,
    wod_performance: "Same",
    knee_status: "All good",
  });

  const [bioAlerts, setBioAlerts] = useState<{ text: string; severity: "red" | "amber" }[]>([]);
  const [bioSaved, setBioSaved] = useState(false);

  useEffect(() => {
    if (biometrics) {
      setBioForm(biometrics);
      setBioSaved(true);
    } else {
      setBioForm({
        date: sundayDateStr,
        avg_weight: 0,
        resting_hr: 0,
        energy: 5,
        wod_performance: "Same",
        knee_status: "All good",
      });
      setBioSaved(false);
    }
  }, [biometrics, sundayDateStr]);

  // ── Session edit dialog state ──
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    dateStr: string;
    sessionKey: string;
    type: SessionType;
    label: string;
  } | null>(null);

  // ── Protein toggle ──
  const todaySession = weekSessions[todayStr];

  const handleProteinToggle = useCallback(async () => {
    const existing = weekSessions[todayStr] || {
      date: todayStr,
      sessions: {},
      protein_hit: false,
    };
    const updated = { ...existing, protein_hit: !existing.protein_hit };
    setWeekSessions((prev) => ({ ...prev, [todayStr]: updated }));
    await fetch("/api/training/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }, [weekSessions, todayStr]);

  // ── Session save handler ──
  const handleSessionSave = useCallback(
    async (
      dateStr: string,
      sessionKey: string,
      data: { done: boolean; notes: string; metric: string }
    ) => {
      const existing = weekSessions[dateStr] || {
        date: dateStr,
        sessions: {},
        protein_hit: false,
      };
      const updated: SessionLog = {
        ...existing,
        sessions: {
          ...existing.sessions,
          [sessionKey]: data,
        },
      };
      setWeekSessions((prev) => ({ ...prev, [dateStr]: updated }));
      await fetch("/api/training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    },
    [weekSessions]
  );

  // ── Biometric save + alerts ──
  const handleBioSave = useCallback(async () => {
    const checkin = { ...bioForm, date: sundayDateStr };
    await saveBiometrics(checkin);
    setBioSaved(true);

    // Decision alerts
    const alerts: { text: string; severity: "red" | "amber" }[] = [];

    if (prevBiometrics && prevBiometrics.avg_weight) {
      if (prevBiometrics.avg_weight - checkin.avg_weight > 1) {
        alerts.push({
          text: "Weight dropped >1kg from last week — Add 200 kcal immediately",
          severity: "red",
        });
      }
    }

    if (prevBiometrics && prevPrevBiometrics) {
      if (
        checkin.resting_hr - prevBiometrics.resting_hr > 5 &&
        prevBiometrics.resting_hr - prevPrevBiometrics.resting_hr > 5
      ) {
        alerts.push({
          text: "Resting HR up >5 bpm for 2+ weeks — Reduce intensity this week",
          severity: "amber",
        });
      }
    }

    if (prevBiometrics && prevPrevBiometrics) {
      if (
        checkin.wod_performance === "Worse" &&
        prevBiometrics.wod_performance === "Worse"
      ) {
        alerts.push({
          text: "WOD performance worse 2 weeks running — Check protein — hitting 200g/day?",
          severity: "amber",
        });
      }
    }

    if (checkin.knee_status === "Swelling") {
      alerts.push({
        text: "Knee swelling detected — Sub all running with bike this week",
        severity: "red",
      });
    }

    setBioAlerts(alerts);
  }, [bioForm, sundayDateStr, saveBiometrics, prevBiometrics, prevPrevBiometrics]);

  // ── Start date save ──
  const handleSetStartDate = useCallback(async () => {
    if (!startDateInput) return;
    await saveConfig({ start_date: startDateInput, current_week_override: null });
  }, [startDateInput, saveConfig]);

  // ── Latest weight from biometrics ──
  const latestWeight = biometrics?.avg_weight || null;

  // ─── Render ──────────────────────────────────────────────

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        Loading training config...
      </div>
    );
  }

  // No start date set
  if (!config?.start_date) {
    return (
      <div className="space-y-6 max-w-md mx-auto pt-12">
        <Card className="bg-white/5 border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Set Training Start Date</h2>
          <p className="text-sm text-white/50 mb-4">
            Enter the Monday you want Week 1 to begin. The 13-week program starts from this date.
          </p>
          <div className="flex gap-3">
            <Input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="bg-white/5 border-white/10 text-white flex-1"
            />
            <Button onClick={handleSetStartDate} className="bg-blue-600 hover:bg-blue-700 text-white">
              Set
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Sub-section 1: Program Config + Phase Badge ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge
            className="text-sm font-semibold px-3 py-1"
            style={{
              backgroundColor: `${PHASE_BADGE_COLORS[phase.phase - 1]}22`,
              color: PHASE_BADGE_COLORS[phase.phase - 1],
              borderColor: PHASE_BADGE_COLORS[phase.phase - 1],
            }}
            variant="outline"
          >
            Phase {phase.phase}: {phase.name}
          </Badge>
          <span className="text-white/50 text-sm">Weeks {phase.weeks}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentWeek <= 1}
            onClick={() => setWeekOffset((o) => o - 1)}
            className="border-white/20 text-white/70 hover:text-white h-8 w-8 p-0"
          >
            ←
          </Button>
          <span className="text-white font-mono text-sm min-w-[80px] text-center">
            Week {currentWeek} / 13
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentWeek >= 13}
            onClick={() => setWeekOffset((o) => o + 1)}
            className="border-white/20 text-white/70 hover:text-white h-8 w-8 p-0"
          >
            →
          </Button>
        </div>
      </div>

      {/* ── Sub-section 2: Phase Focus Panel ── */}
      <Card className="bg-white/5 border-white/10 p-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Phase Focus
        </h3>
        <ul className="space-y-1.5">
          {phase.focus.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: PHASE_BADGE_COLORS[phase.phase - 1] }}
              />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Sub-section 3: Weekly Schedule Grid ── */}
      <Card className="bg-white/5 border-white/10 p-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Weekly Schedule
        </h3>

        {sessionsLoading ? (
          <div className="text-center py-8 text-white/30 text-sm">Loading sessions...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[640px]">
              {/* Day headers */}
              {DAYS.map((day, i) => {
                const isToday = weekDates[i] === todayStr;
                return (
                  <div key={day} className="text-center">
                    <div
                      className={`text-xs font-semibold mb-1 ${
                        isToday ? "text-blue-400" : "text-white/50"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="text-[10px] text-white/30 mb-2">
                      {weekDates[i] ? weekDates[i].slice(5) : "—"}
                    </div>
                  </div>
                );
              })}

              {/* AM row */}
              {DAYS.map((day, i) => {
                const sched = WEEKLY_SCHEDULE[day];
                const dateStr = weekDates[i];
                const sessionKey = `${day}-am`;
                const log = weekSessions[dateStr];
                const sessionData = log?.sessions?.[sessionKey];
                return (
                  <div key={`am-${day}`}>
                    <div className="text-[10px] text-white/30 mb-1 text-center">AM</div>
                    <SessionBadge
                      type={sched.am.type}
                      label={sched.am.label}
                      done={sessionData?.done}
                      onClick={() =>
                        setEditDialog({
                          open: true,
                          dateStr,
                          sessionKey,
                          type: sched.am.type,
                          label: sched.am.label,
                        })
                      }
                    />
                  </div>
                );
              })}

              {/* PM row */}
              {DAYS.map((day, i) => {
                const sched = WEEKLY_SCHEDULE[day];
                const dateStr = weekDates[i];
                const sessionKey = `${day}-pm`;
                const log = weekSessions[dateStr];
                const sessionData = log?.sessions?.[sessionKey];
                return (
                  <div key={`pm-${day}`}>
                    <div className="text-[10px] text-white/30 mb-1 text-center">PM</div>
                    <SessionBadge
                      type={sched.pm.type}
                      label={sched.pm.label}
                      done={sessionData?.done}
                      onClick={() =>
                        setEditDialog({
                          open: true,
                          dateStr,
                          sessionKey,
                          type: sched.pm.type,
                          label: sched.pm.label,
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Session Edit Dialog */}
      {editDialog && (
        <SessionEditDialog
          open={editDialog.open}
          onClose={() => setEditDialog(null)}
          sessionKey={editDialog.sessionKey}
          type={editDialog.type}
          label={editDialog.label}
          sessionData={
            weekSessions[editDialog.dateStr]?.sessions?.[editDialog.sessionKey] || {
              done: false,
              notes: "",
              metric: "",
            }
          }
          onSave={(data) => handleSessionSave(editDialog.dateStr, editDialog.sessionKey, data)}
        />
      )}

      {/* ── Sub-section 4: Nutrition Daily Targets ── */}
      <Card className="bg-white/5 border-white/10 p-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Nutrition Targets — {isSunday ? "Rest Day" : "Training Day"}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {isSunday ? (
            <>
              <NutritionStat label="Calories" value="2,100–2,200" unit="kcal" color="#e8a030" />
              <NutritionStat label="Protein" value="200" unit="g" color="#e06050" />
            </>
          ) : (
            <>
              <NutritionStat label="Calories" value="2,500" unit="kcal" color="#e8a030" />
              <NutritionStat label="Protein" value="200" unit="g" color="#e06050" />
              <NutritionStat label="Carbs" value="250" unit="g" color="#3ab8d0" />
              <NutritionStat label="Fat" value="78" unit="g" color="#a060e0" />
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
          <span className="text-sm text-white/70">Hit 200g protein today?</span>
          <Button
            size="sm"
            variant={todaySession?.protein_hit ? "default" : "outline"}
            onClick={handleProteinToggle}
            className={
              todaySession?.protein_hit
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-white/20 text-white/50"
            }
          >
            {todaySession?.protein_hit ? "Yes ✓" : "No"}
          </Button>
        </div>
      </Card>

      {/* ── Sub-section 5: Biometric Sunday Check-in ── */}
      <Card
        className={`border-white/10 p-4 transition-all ${
          isSunday ? "bg-white/5" : "bg-white/[0.02] opacity-60"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Sunday Biometric Check-in
          </h3>
          {!isSunday && (
            <Badge variant="outline" className="text-white/30 border-white/10 text-xs">
              Available on Sundays
            </Badge>
          )}
        </div>

        {isSunday ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">7-day avg weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={bioForm.avg_weight || ""}
                  onChange={(e) =>
                    setBioForm((f) => ({ ...f, avg_weight: parseFloat(e.target.value) || 0 }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Resting HR (bpm)</label>
                <Input
                  type="number"
                  value={bioForm.resting_hr || ""}
                  onChange={(e) =>
                    setBioForm((f) => ({ ...f, resting_hr: parseInt(e.target.value) || 0 }))
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">
                Subjective energy: {bioForm.energy}/10
              </label>
              <Slider
                value={[bioForm.energy]}
                onValueChange={(v) => setBioForm((f) => ({ ...f, energy: Array.isArray(v) ? v[0] : v }))}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-2 block">WOD Performance</label>
              <div className="flex gap-2">
                {(["Better", "Same", "Worse"] as const).map((opt) => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={bioForm.wod_performance === opt ? "default" : "outline"}
                    onClick={() => setBioForm((f) => ({ ...f, wod_performance: opt }))}
                    className={
                      bioForm.wod_performance === opt
                        ? opt === "Better"
                          ? "bg-green-600 text-white"
                          : opt === "Same"
                          ? "bg-blue-600 text-white"
                          : "bg-red-600 text-white"
                        : "border-white/20 text-white/50"
                    }
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 mb-2 block">Knee Status</label>
              <div className="flex gap-2 flex-wrap">
                {(["All good", "Minor tightness", "Swelling"] as const).map((opt) => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={bioForm.knee_status === opt ? "default" : "outline"}
                    onClick={() => setBioForm((f) => ({ ...f, knee_status: opt }))}
                    className={
                      bioForm.knee_status === opt
                        ? opt === "All good"
                          ? "bg-green-600 text-white"
                          : opt === "Minor tightness"
                          ? "bg-amber-600 text-white"
                          : "bg-red-600 text-white"
                        : "border-white/20 text-white/50"
                    }
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleBioSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {bioSaved ? "Update Check-in" : "Save Check-in"}
            </Button>

            {/* Decision Alerts */}
            {bioAlerts.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Decision Alerts
                </h4>
                {bioAlerts.map((alert, i) => (
                  <AlertBanner key={i} text={alert.text} severity={alert.severity} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/30">
            Check in every Sunday with your weight, HR, energy, and performance markers.
          </p>
        )}
      </Card>

      {/* ── Sub-section 6: Body Composition Tracker ── */}
      <Card className="bg-white/5 border-white/10 p-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Body Composition
        </h3>

        <BodyCompChart
          currentWeight={latestWeight}
          currentWeek={currentWeek}
          phase={phase.phase}
        />

        {phase.phase === 3 && latestWeight !== null && latestWeight <= 95 && (
          <div
            className="mt-3 px-4 py-3 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "rgba(58,184,208,0.12)",
              borderLeft: "4px solid #3ab8d0",
              color: "#7ad4e8",
            }}
          >
            Phase 3 + weight ≤ 95kg — Shift to maintenance calories 2,800–3,000 kcal
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Small sub-components ──────────────────────────────────

function NutritionStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ backgroundColor: `${color}12`, border: `1px solid ${color}30` }}
    >
      <div className="text-xs text-white/40 mb-0.5">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
        <span className="text-xs font-normal ml-0.5 opacity-60">{unit}</span>
      </div>
    </div>
  );
}
