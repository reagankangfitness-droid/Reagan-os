"use client";

import { useState } from "react";
import {
  CalendarCheck,
  BarChart3,
  DollarSign,
  Lightbulb,
  FileText,
  Dumbbell,
} from "lucide-react";
import TodayTab from "@/components/tabs/today";
import ScorecardTab from "@/components/tabs/scorecard";
import IncomeTab from "@/components/tabs/income";
import PipelineTab from "@/components/tabs/pipeline";
import ContentBankTab from "@/components/tabs/content-bank";
import TrainingTab from "@/components/tabs/training";

const TABS = [
  { id: "today", label: "Today", icon: CalendarCheck },
  { id: "scorecard", label: "Scorecard", icon: BarChart3 },
  { id: "income", label: "Income", icon: DollarSign },
  { id: "pipeline", label: "Pipeline", icon: Lightbulb },
  { id: "content", label: "Content", icon: FileText },
  { id: "training", label: "Training", icon: Dumbbell },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("today");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center gap-1 px-6 py-3 border-b border-border bg-[#0c0e14]">
        <span className="text-lg font-bold text-white mr-6 tracking-tight">
          Reagan OS
        </span>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#378ADD]/15 text-[#378ADD]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {activeTab === "today" && <TodayTab />}
          {activeTab === "scorecard" && <ScorecardTab />}
          {activeTab === "income" && <IncomeTab />}
          {activeTab === "pipeline" && <PipelineTab />}
          {activeTab === "content" && <ContentBankTab />}
          {activeTab === "training" && <TrainingTab />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 py-2 border-t border-border bg-[#0c0e14] z-50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                active
                  ? "text-[#378ADD]"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
