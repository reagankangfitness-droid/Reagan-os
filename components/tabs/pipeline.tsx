"use client";

import { useState } from "react";
import { useIdeas } from "@/lib/hooks";
import type { SaasIdea } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FILTER_QUESTIONS: { key: keyof Pick<SaasIdea, "audience_match" | "validate_2w" | "recurring_revenue" | "solo_buildable">; label: string }[] = [
  { key: "audience_match", label: "Audience match \u2014 does your 20k+ fitness audience have this problem?" },
  { key: "validate_2w", label: "Validate in 2 weeks? \u2014 poll or waitlist test possible?" },
  { key: "recurring_revenue", label: "Recurring revenue path \u2014 natural subscription model?" },
  { key: "solo_buildable", label: "Solo buildable in 4 weeks? \u2014 MVP alone in a month?" },
];

const STATUS_OPTIONS: SaasIdea["status"][] = ["Idea", "Validating", "Building", "Killed"];

const STATUS_COLORS: Record<SaasIdea["status"], string> = {
  Idea: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
  Validating: "bg-amber-900/60 text-amber-300 hover:bg-amber-900/80",
  Building: "bg-blue-900/60 text-blue-300 hover:bg-blue-900/80",
  Killed: "bg-red-900/60 text-red-400 hover:bg-red-900/80",
};

function scoreIdea(idea: SaasIdea): number {
  return (
    (idea.audience_match ? 1 : 0) +
    (idea.validate_2w ? 1 : 0) +
    (idea.recurring_revenue ? 1 : 0) +
    (idea.solo_buildable ? 1 : 0)
  );
}

export default function PipelineTab() {
  const { data: ideas, isLoading, save } = useIdeas();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const sortedIdeas = [...ideas].sort((a, b) => scoreIdea(b) - scoreIdea(a));

  const addIdea = () => {
    if (!newName.trim()) return;
    const idea: SaasIdea = {
      id: crypto.randomUUID?.() ?? Date.now().toString(36),
      name: newName.trim(),
      description: newDesc.trim(),
      audience_match: false,
      validate_2w: false,
      recurring_revenue: false,
      solo_buildable: false,
      status: "Idea",
      notes: "",
      created_at: new Date().toISOString(),
    };
    save([...ideas, idea]);
    setNewName("");
    setNewDesc("");
  };

  const updateIdea = (id: string, patch: Partial<SaasIdea>) => {
    const updated = ideas.map((i) => (i.id === id ? { ...i, ...patch } : i));
    save(updated);
  };

  const deleteIdea = (id: string) => {
    save(ideas.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Add new idea form */}
      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">
            Add New Idea
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Idea name"
            className="bg-zinc-900 border-zinc-700"
            onKeyDown={(e) => e.key === "Enter" && addIdea()}
          />
          <Textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Short description..."
            rows={2}
            className="bg-zinc-900 border-zinc-700 text-sm"
          />
          <Button onClick={addIdea} className="bg-[#378ADD] hover:bg-[#2a6db5]">
            Add Idea
          </Button>
        </CardContent>
      </Card>

      {/* Ideas list */}
      {isLoading && (
        <p className="text-zinc-500 text-sm text-center">Loading ideas...</p>
      )}

      {sortedIdeas.map((idea) => {
        const score = scoreIdea(idea);
        return (
          <Card key={idea.id} className="border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-100 truncate">
                    {idea.name}
                  </h3>
                  {idea.description && (
                    <p className="text-sm text-zinc-400 mt-1">{idea.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Score */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg"
                    style={{
                      backgroundColor:
                        score >= 3
                          ? "rgba(16,185,129,0.2)"
                          : score >= 2
                          ? "rgba(245,158,11,0.2)"
                          : "rgba(239,68,68,0.2)",
                      color:
                        score >= 3 ? "#10b981" : score >= 2 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {score}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIdea(idea.id)}
                    className="text-zinc-600 hover:text-red-400 text-xs px-2"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Filter questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FILTER_QUESTIONS.map((q) => {
                  const val = idea[q.key];
                  return (
                    <button
                      key={q.key}
                      onClick={() => updateIdea(idea.id, { [q.key]: !val })}
                      className={`text-left text-xs px-3 py-2 rounded-md border transition-colors ${
                        val
                          ? "border-emerald-600/50 bg-emerald-950/40 text-emerald-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      <span className="mr-1.5">{val ? "\u2713" : "\u2717"}</span>
                      {q.label}
                    </button>
                  );
                })}
              </div>

              {/* Status tags */}
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <Badge
                    key={s}
                    className={`cursor-pointer transition-all text-xs ${
                      STATUS_COLORS[s]
                    } ${
                      idea.status === s
                        ? "ring-2 ring-offset-1 ring-offset-zinc-950 ring-zinc-400"
                        : "opacity-50"
                    }`}
                    onClick={() => updateIdea(idea.id, { status: s })}
                  >
                    {s}
                  </Badge>
                ))}
              </div>

              {/* Notes */}
              <Textarea
                value={idea.notes}
                onChange={(e) => updateIdea(idea.id, { notes: e.target.value })}
                placeholder="Notes..."
                rows={2}
                className="bg-zinc-900 border-zinc-700 text-sm"
              />
            </CardContent>
          </Card>
        );
      })}

      {!isLoading && sortedIdeas.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-8">
          No ideas yet. Add your first one above.
        </p>
      )}
    </div>
  );
}
