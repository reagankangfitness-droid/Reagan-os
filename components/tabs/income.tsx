"use client";

import { useState, useEffect, useCallback } from "react";
import { useIncome } from "@/lib/hooks";
import type { IncomeMonth } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ACCENT = "#378ADD";
const PILLAR1_FIXED = 6000;
const TARGET = 10000;
const PILLAR2_TARGET = 2000;
const PILLAR3_TARGET = 2000;

const PILLAR_COLORS = {
  pillar1: "#378ADD",
  pillar2: "#f59e0b",
  pillar3: "#10b981",
};

function formatMonth(offset: number, base: Date = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return d.toISOString().slice(0, 7);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface HistoryEntry {
  month: string;
  pillar1: number;
  pillar2: number;
  pillar3: number;
}

export default function IncomeTab() {
  const [monthOffset, setMonthOffset] = useState(0);
  const currentMonth = formatMonth(monthOffset);
  const { data, isLoading, save } = useIncome(currentMonth);

  const [pillar2, setPillar2] = useState("");
  const [pillar3, setPillar3] = useState("");
  const [pillar2Notes, setPillar2Notes] = useState("");
  const [pillar3Notes, setPillar3Notes] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Sync local state when data loads or month changes
  useEffect(() => {
    if (data) {
      setPillar2(data.pillar2_actual?.toString() ?? "0");
      setPillar3(data.pillar3_actual?.toString() ?? "0");
      setPillar2Notes(data.pillar2_notes ?? "");
      setPillar3Notes(data.pillar3_notes ?? "");
    } else if (!isLoading) {
      setPillar2("0");
      setPillar3("0");
      setPillar2Notes("");
      setPillar3Notes("");
    }
  }, [data, isLoading, currentMonth]);

  // Fetch last 6 months for chart
  useEffect(() => {
    const months = Array.from({ length: 6 }, (_, i) => formatMonth(monthOffset - 5 + i));
    Promise.all(
      months.map((m) =>
        fetch(`/api/income?month=${m}`)
          .then((r) => r.json())
          .then((d: IncomeMonth | null) => ({
            month: m,
            pillar1: PILLAR1_FIXED,
            pillar2: d?.pillar2_actual ?? 0,
            pillar3: d?.pillar3_actual ?? 0,
          }))
          .catch(() => ({ month: m, pillar1: PILLAR1_FIXED, pillar2: 0, pillar3: 0 }))
      )
    ).then(setHistory);
  }, [monthOffset]);

  const p2 = parseFloat(pillar2) || 0;
  const p3 = parseFloat(pillar3) || 0;
  const total = PILLAR1_FIXED + p2 + p3;
  const progressPct = Math.min((total / TARGET) * 100, 100);

  const handleSave = useCallback(() => {
    save({
      month: currentMonth,
      pillar2_actual: p2,
      pillar3_actual: p3,
      pillar2_notes: pillar2Notes,
      pillar3_notes: pillar3Notes,
    });
  }, [currentMonth, p2, p3, pillar2Notes, pillar3Notes, save]);

  const maxBar = Math.max(
    TARGET,
    ...history.map((h) => h.pillar1 + h.pillar2 + h.pillar3)
  );

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setMonthOffset((o) => o - 1)}>
          &larr;
        </Button>
        <h2 className="text-lg font-semibold" style={{ color: ACCENT }}>
          {monthLabel(currentMonth)}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setMonthOffset((o) => o + 1)}>
          &rarr;
        </Button>
      </div>

      {/* Three pillar cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <Card className="border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Pillar 1 &mdash; Full-time Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: PILLAR_COLORS.pillar1 }}>
              ${PILLAR1_FIXED.toLocaleString()}/mo
            </p>
            <p className="text-xs text-zinc-500 mt-1">Fixed income</p>
          </CardContent>
        </Card>

        {/* Pillar 2 */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Pillar 2 &mdash; IG/TT + Coaching
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-zinc-500">
              Target: ${PILLAR2_TARGET.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">$</span>
              <Input
                type="number"
                value={pillar2}
                onChange={(e) => setPillar2(e.target.value)}
                onBlur={handleSave}
                placeholder="0"
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
            <Textarea
              value={pillar2Notes}
              onChange={(e) => setPillar2Notes(e.target.value)}
              onBlur={handleSave}
              placeholder="Notes..."
              rows={2}
              className="bg-zinc-900 border-zinc-700 text-sm"
            />
          </CardContent>
        </Card>

        {/* Pillar 3 */}
        <Card className="border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Pillar 3 &mdash; SaaS / AI Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-zinc-500">
              Target: ${PILLAR3_TARGET.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">$</span>
              <Input
                type="number"
                value={pillar3}
                onChange={(e) => setPillar3(e.target.value)}
                onBlur={handleSave}
                placeholder="0"
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
            <Textarea
              value={pillar3Notes}
              onChange={(e) => setPillar3Notes(e.target.value)}
              onBlur={handleSave}
              placeholder="Notes..."
              rows={2}
              className="bg-zinc-900 border-zinc-700 text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Total + progress */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Monthly Total</span>
            <span className="text-xl font-bold" style={{ color: ACCENT }}>
              ${total.toLocaleString()}{" "}
              <span className="text-sm font-normal text-zinc-500">
                / ${TARGET.toLocaleString()}
              </span>
            </span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>$0</span>
            <span>${TARGET.toLocaleString()} target</span>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} style={{ backgroundColor: ACCENT }}>
          Save
        </Button>
      </div>

      {/* History chart - pure CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PILLAR_COLORS.pillar1 }} />
              <span className="text-zinc-400">Full-time</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PILLAR_COLORS.pillar2 }} />
              <span className="text-zinc-400">IG/TT + Coaching</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PILLAR_COLORS.pillar3 }} />
              <span className="text-zinc-400">SaaS/AI</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-48 relative">
            {history.map((h) => {
              const totalH = h.pillar1 + h.pillar2 + h.pillar3;
              const pct1 = (h.pillar1 / maxBar) * 100;
              const pct2 = (h.pillar2 / maxBar) * 100;
              const pct3 = (h.pillar3 / maxBar) * 100;

              return (
                <div key={h.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] text-zinc-500 mb-1">
                    ${(totalH / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full flex flex-col-reverse" style={{ height: "80%" }}>
                    {/* Pillar 1 - bottom */}
                    <div
                      className="w-full rounded-t-none rounded-b-sm transition-all"
                      style={{
                        height: `${pct1}%`,
                        backgroundColor: PILLAR_COLORS.pillar1,
                        minHeight: pct1 > 0 ? "2px" : 0,
                      }}
                    />
                    {/* Pillar 2 - middle */}
                    <div
                      className="w-full transition-all"
                      style={{
                        height: `${pct2}%`,
                        backgroundColor: PILLAR_COLORS.pillar2,
                        minHeight: pct2 > 0 ? "2px" : 0,
                      }}
                    />
                    {/* Pillar 3 - top */}
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${pct3}%`,
                        backgroundColor: PILLAR_COLORS.pillar3,
                        minHeight: pct3 > 0 ? "2px" : 0,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1">
                    {monthLabel(h.month).split(" ")[0]}
                  </span>
                </div>
              );
            })}

            {/* Target line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-zinc-600"
              style={{ bottom: `${(TARGET / maxBar) * 80}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
