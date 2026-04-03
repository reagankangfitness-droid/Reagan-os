"use client";
import useSWR, { mutate } from "swr";
import {
  HabitDay,
  IncomeMonth,
  SaasIdea,
  ContentIdea,
  SessionLog,
  BiometricCheckin,
  TrainingConfig,
} from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Habits ──
export function useHabits(date: string) {
  const { data, error, isLoading } = useSWR<HabitDay>(
    `/api/habits?date=${date}`,
    fetcher
  );
  const save = async (habits: HabitDay) => {
    mutate(`/api/habits?date=${date}`, habits, false);
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habits),
    });
    mutate(`/api/habits?date=${date}`);
  };
  return { data, error, isLoading, save };
}

// ── Income ──
export function useIncome(month: string) {
  const { data, error, isLoading } = useSWR<IncomeMonth>(
    `/api/income?month=${month}`,
    fetcher
  );
  const save = async (income: IncomeMonth) => {
    mutate(`/api/income?month=${month}`, income, false);
    await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(income),
    });
    mutate(`/api/income?month=${month}`);
  };
  return { data, error, isLoading, save };
}

// ── SaaS Ideas ──
export function useIdeas() {
  const { data, error, isLoading } = useSWR<SaasIdea[]>("/api/ideas", fetcher);
  const save = async (ideas: SaasIdea[]) => {
    mutate("/api/ideas", ideas, false);
    await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ideas),
    });
    mutate("/api/ideas");
  };
  return { data: data || [], error, isLoading, save };
}

// ── Content Bank ──
export function useContent() {
  const { data, error, isLoading } = useSWR<ContentIdea[]>(
    "/api/content",
    fetcher
  );
  const save = async (content: ContentIdea[]) => {
    mutate("/api/content", content, false);
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    mutate("/api/content");
  };
  return { data: data || [], error, isLoading, save };
}

// ── Training Sessions ──
export function useTrainingSessions(date: string) {
  const { data, error, isLoading } = useSWR<SessionLog>(
    `/api/training/sessions?date=${date}`,
    fetcher
  );
  const save = async (log: SessionLog) => {
    mutate(`/api/training/sessions?date=${date}`, log, false);
    await fetch("/api/training/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    mutate(`/api/training/sessions?date=${date}`);
  };
  return { data, error, isLoading, save };
}

// ── Biometrics ──
export function useBiometrics(date: string) {
  const { data, error, isLoading } = useSWR<BiometricCheckin | null>(
    `/api/training/biometrics?date=${date}`,
    fetcher
  );
  const save = async (checkin: BiometricCheckin) => {
    mutate(`/api/training/biometrics?date=${date}`, checkin, false);
    await fetch("/api/training/biometrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkin),
    });
    mutate(`/api/training/biometrics?date=${date}`);
  };
  return { data, error, isLoading, save };
}

// ── Training Config ──
export function useTrainingConfig() {
  const { data, error, isLoading } = useSWR<TrainingConfig>(
    "/api/training/config",
    fetcher
  );
  const save = async (config: TrainingConfig) => {
    mutate("/api/training/config", config, false);
    await fetch("/api/training/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    mutate("/api/training/config");
  };
  return { data, error, isLoading, save };
}
