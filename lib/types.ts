// ── Habits ──
export interface HabitDay {
  date: string; // YYYY-MM-DD
  habits: {
    content: boolean;
    saas_task: boolean;
    outreach: boolean;
    batch_content: boolean;   // Sunday only
    review_metrics: boolean;  // Friday only
    saas_focus: boolean;      // Saturday only
  };
}

export const HABITS = [
  { key: "content" as const, label: "Post one piece of content", daily: true, dayOnly: null, color: "blue" },
  { key: "saas_task" as const, label: "Ship one SaaS task — 30 min", daily: true, dayOnly: null, color: "amber" },
  { key: "outreach" as const, label: "One outreach DM or pitch", daily: true, dayOnly: null, color: "green" },
  { key: "batch_content" as const, label: "Batch 7 content ideas", daily: false, dayOnly: 0, color: "blue" },
  { key: "review_metrics" as const, label: "Review metrics + one experiment", daily: false, dayOnly: 5, color: "green" },
  { key: "saas_focus" as const, label: "SaaS focus session 90 min", daily: false, dayOnly: 6, color: "amber" },
] as const;

export type HabitKey = typeof HABITS[number]["key"];

// ── Income ──
export interface IncomeMonth {
  month: string; // YYYY-MM
  pillar2_actual: number;
  pillar3_actual: number;
  pillar2_notes: string;
  pillar3_notes: string;
}

// ── SaaS Pipeline ──
export interface SaasIdea {
  id: string;
  name: string;
  description: string;
  audience_match: boolean;
  validate_2w: boolean;
  recurring_revenue: boolean;
  solo_buildable: boolean;
  status: "Idea" | "Validating" | "Building" | "Killed";
  notes: string;
  created_at: string;
}

// ── Content Bank ──
export type ContentPillar = "Personal brand" | "SweatBuddies" | "Plantee";
export type ContentFormat = "Reel" | "Carousel" | "Story" | "Static";
export type ContentStatus = "Idea" | "Scripted" | "Filmed" | "Posted";

export interface ContentIdea {
  id: string;
  idea: string;
  pillar: ContentPillar;
  format: ContentFormat;
  status: ContentStatus;
  created_at: string;
  posted_at: string | null;
}

// ── Training ──
export type SessionType = "FF" | "HX" | "GYM" | "MOB" | "LIFT" | "REST";

export const SESSION_COLORS: Record<SessionType, string> = {
  FF: "#e8a030",
  HX: "#3ab8d0",
  GYM: "#a060e0",
  MOB: "#3ab87a",
  LIFT: "#e06050",
  REST: "#666",
};

export const SESSION_LABELS: Record<SessionType, string> = {
  FF: "Functional Fitness",
  HX: "Hyrox",
  GYM: "Gymnastics Skill",
  MOB: "Mobility / Recovery",
  LIFT: "Strength",
  REST: "Rest",
};

export interface WeeklySchedule {
  [day: string]: { am: { type: SessionType; label: string }; pm: { type: SessionType; label: string } };
}

export const WEEKLY_SCHEDULE: WeeklySchedule = {
  Mon: { am: { type: "FF", label: "FF WOD" }, pm: { type: "HX", label: "Long Run" } },
  Tue: { am: { type: "GYM", label: "GYM Skill" }, pm: { type: "LIFT", label: "Strength" } },
  Wed: { am: { type: "FF", label: "FF + MOB" }, pm: { type: "REST", label: "Rest" } },
  Thu: { am: { type: "HX", label: "HX Intervals" }, pm: { type: "REST", label: "Rest" } },
  Fri: { am: { type: "FF", label: "FF WOD" }, pm: { type: "MOB", label: "Mobility" } },
  Sat: { am: { type: "HX", label: "HX Complete / Long WOD" }, pm: { type: "REST", label: "Rest" } },
  Sun: { am: { type: "REST", label: "REST + Check-in" }, pm: { type: "REST", label: "Rest" } },
};

export interface SessionLog {
  date: string;
  sessions: {
    [key: string]: {
      done: boolean;
      notes: string;
      metric: string;
    };
  };
  protein_hit: boolean;
}

export interface BiometricCheckin {
  date: string;
  avg_weight: number;
  resting_hr: number;
  energy: number;
  wod_performance: "Better" | "Same" | "Worse";
  knee_status: "All good" | "Minor tightness" | "Swelling";
}

export interface TrainingConfig {
  start_date: string; // YYYY-MM-DD
  current_week_override: number | null;
}

export interface PhaseInfo {
  phase: number;
  name: string;
  weeks: string;
  focus: string[];
}

export const PHASES: PhaseInfo[] = [
  {
    phase: 1,
    name: "Base Building",
    weeks: "1–4",
    focus: ["Zone 2 HR cap 145 bpm", "No muscle-ups in WODs", "Bodyweight benchmark"],
  },
  {
    phase: 2,
    name: "Build",
    weeks: "5–9",
    focus: ["Gymnastics skill progression", "Hyrox sim weekly", "Zone 2 → 60 min"],
  },
  {
    phase: 3,
    name: "Peak + Test",
    weeks: "10–13",
    focus: ["Race effort", "5km sub-30 min target", "Week 13 assessment week"],
  },
];

export const BODY_COMP_CHECKPOINTS = [
  { week: 0, weight: 100, bf: 21, label: "Start" },
  { week: 4, weight: 97, bf: 18, label: "Wk 4" },
  { week: 9, weight: 95, bf: 14, label: "Wk 9" },
  { week: 13, weight: 93.5, bf: 12, label: "Target" },
];
