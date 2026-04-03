"use client";

import { useState } from "react";
import { useContent } from "@/lib/hooks";
import {
  ContentIdea,
  ContentPillar,
  ContentFormat,
  ContentStatus,
} from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

// ── Constants ──
const PILLARS: ContentPillar[] = ["Personal brand", "SweatBuddies", "Plantee"];
const FORMATS: ContentFormat[] = ["Reel", "Carousel", "Story", "Static"];
const STATUSES: ContentStatus[] = ["Idea", "Scripted", "Filmed", "Posted"];

const PILLAR_COLORS: Record<ContentPillar, string> = {
  "Personal brand": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  SweatBuddies: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Plantee: "bg-lime-500/20 text-lime-300 border-lime-500/30",
};

const FORMAT_COLORS: Record<ContentFormat, string> = {
  Reel: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Carousel: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Story: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Static: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  Idea: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
  Scripted: "bg-blue-700 text-blue-200 hover:bg-blue-600",
  Filmed: "bg-amber-700 text-amber-200 hover:bg-amber-600",
  Posted: "bg-emerald-700 text-emerald-200 hover:bg-emerald-600",
};

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 6)
  );
}

export default function ContentBank() {
  const { data: content, isLoading, save } = useContent();

  // Quick-add form state
  const [newIdea, setNewIdea] = useState("");
  const [newPillar, setNewPillar] = useState<ContentPillar>("Personal brand");
  const [newFormat, setNewFormat] = useState<ContentFormat>("Reel");

  // Filter state
  const [filterPillar, setFilterPillar] = useState<ContentPillar | "All">("All");
  const [filterFormat, setFilterFormat] = useState<ContentFormat | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Add new idea ──
  const handleAdd = () => {
    const trimmed = newIdea.trim();
    if (!trimmed) return;

    const idea: ContentIdea = {
      id: generateId(),
      idea: trimmed,
      pillar: newPillar,
      format: newFormat,
      status: "Idea",
      created_at: new Date().toISOString().split("T")[0],
      posted_at: null,
    };

    save([idea, ...content]);
    setNewIdea("");
  };

  // ── Update status ──
  const handleStatusChange = (id: string, status: ContentStatus) => {
    const updated = content.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        status,
        posted_at:
          status === "Posted"
            ? new Date().toISOString().split("T")[0]
            : item.posted_at,
      };
    });
    save(updated);
  };

  // ── Filter + search + sort ──
  const filtered = content
    .filter((item) => {
      if (filterPillar !== "All" && item.pillar !== filterPillar) return false;
      if (filterFormat !== "All" && item.format !== filterFormat) return false;
      if (
        searchQuery &&
        !item.idea.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading content bank...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Quick-add form ── */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardContent className="space-y-3">
          <Input
            placeholder="Content idea..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="bg-zinc-800/60 border-zinc-700"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={newPillar} onValueChange={(val) => setNewPillar(val as ContentPillar)}>
              <SelectTrigger className="bg-zinc-800/60 border-zinc-700">
                <SelectValue placeholder="Pillar" />
              </SelectTrigger>
              <SelectContent>
                {PILLARS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newFormat} onValueChange={(val) => setNewFormat(val as ContentFormat)}>
              <SelectTrigger className="bg-zinc-800/60 border-zinc-700">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAdd}
              disabled={!newIdea.trim()}
              size="sm"
              className="gap-1"
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-zinc-800/60 border-zinc-700"
          />
        </div>

        <Select
          value={filterPillar}
          onValueChange={(val) => setFilterPillar(val as ContentPillar | "All")}
        >
          <SelectTrigger className="bg-zinc-800/60 border-zinc-700">
            <SelectValue placeholder="Pillar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Pillars</SelectItem>
            {PILLARS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterFormat}
          onValueChange={(val) => setFilterFormat(val as ContentFormat | "All")}
        >
          <SelectTrigger className="bg-zinc-800/60 border-zinc-700">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Formats</SelectItem>
            {FORMATS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Count ── */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} idea{filtered.length !== 1 ? "s" : ""}
        {content.length !== filtered.length && ` of ${content.length} total`}
      </p>

      {/* ── Content list ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {content.length === 0
            ? "No content ideas yet. Add one above!"
            : "No ideas match your filters."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <Card
              key={item.id}
              size="sm"
              className="bg-zinc-900/60 border-zinc-800"
            >
              <CardContent className="space-y-2">
                {/* Idea text */}
                <p className="text-sm text-zinc-100 leading-snug">
                  {item.idea}
                </p>

                {/* Badges + status row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={`border text-[11px] ${PILLAR_COLORS[item.pillar]}`}
                  >
                    {item.pillar}
                  </Badge>
                  <Badge
                    className={`border text-[11px] ${FORMAT_COLORS[item.format]}`}
                  >
                    {item.format}
                  </Badge>

                  <span className="flex-1" />

                  {/* Status buttons */}
                  <div className="flex gap-1">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(item.id, s)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          item.status === s
                            ? STATUS_COLORS[s]
                            : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date row */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Added {item.created_at}</span>
                  {item.posted_at && (
                    <span className="text-emerald-400">
                      Posted {item.posted_at}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
