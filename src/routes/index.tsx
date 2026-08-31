import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopNav } from "@/components/mindloom/TopNav";
import { JournalPanel } from "@/components/mindloom/JournalPanel";
import { EmptyState, InsightPanel } from "@/components/mindloom/InsightPanel";
import { Analytics, type MoodPoint } from "@/components/mindloom/Analytics";
import { SafetyBanner } from "@/components/mindloom/SafetyBanner";
import {
  EMPTY_INSIGHT,
  insightToProtocol,
  insightToSummary,
  mockInsight,
  parseInsight,
  type Insight,
} from "@/lib/mindloom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindLoom AI — AI Journaling & Micro-Reset for High-Stress Days" },
      {
        name: "description",
        content:
          "MindLoom AI turns a 60-second journal entry into an emotion read, a compassionate insight, and a one-minute guided reset. Wellness support, not medical advice.",
      },
      { property: "og:title", content: "MindLoom AI — Reflect, Understand, Reset" },
      {
        property: "og:description",
        content:
          "AI-powered journaling for high-stress environments: emotion detection, empathetic insight, and guided one-minute micro-resets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MOOD_DATA: MoodPoint[] = [
  { day: "Mon", balance: 52, stress: 74 },
  { day: "Tue", balance: 48, stress: 79 },
  { day: "Wed", balance: 57, stress: 68 },
  { day: "Thu", balance: 61, stress: 63 },
  { day: "Fri", balance: 55, stress: 71 },
  { day: "Sat", balance: 70, stress: 48 },
  { day: "Sun", balance: 76, stress: 41 },
  { day: "Mon", balance: 66, stress: 55 },
  { day: "Tue", balance: 69, stress: 52 },
  { day: "Wed", balance: 73, stress: 47 },
  { day: "Thu", balance: 71, stress: 50 },
  { day: "Fri", balance: 78, stress: 42 },
  { day: "Sat", balance: 82, stress: 36 },
  { day: "Sun", balance: 80, stress: 38 },
];

function Index() {
  const [journal, setJournal] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [streaming, setStreaming] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const streamMock = useCallback(async (text: string) => {
    const full = insightToProtocol(mockInsight(text));
    let acc = "";
    for (const chunk of full.match(/.{1,4}/gs) ?? []) {
      acc += chunk;
      setInsight(parseInsight(acc));
      await new Promise((r) => setTimeout(r, 12));
    }
  }, []);

  const process = useCallback(async () => {
    if (!journal.trim()) return;
    setStreaming(true);
    setInsight({ ...EMPTY_INSIGHT, taskSteps: [] });
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal, tags }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setInsight(parseInsight(acc));
      }
      if (!parseInsight(acc).emotion) throw new Error("empty");
    } catch {
      toast.info("Offline demo mode — showing a sample analysis.");
      await streamMock(journal);
    } finally {
      setStreaming(false);
    }
  }, [journal, tags, streamMock]);

  const summary = useMemo(
    () => (insight ? insightToSummary(insight, journal) : ""),
    [insight, journal],
  );

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  const downloadImage = () => {
    if (!insight) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 620;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 1000, 620);
    g.addColorStop(0, "#1a1533");
    g.addColorStop(1, "#2a1f52");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1000, 620);
    ctx.fillStyle = "#c4b5fd";
    ctx.font = "600 30px sans-serif";
    ctx.fillText("MindLoom AI — Reflection Summary", 60, 80);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 44px sans-serif";
    ctx.fillText(`${insight.emotion} · ${insight.confidence}%`, 60, 160);
    ctx.font = "22px sans-serif";
    ctx.fillStyle = "#e5e0f5";
    const words = insight.insight.split(" ");
    let line = "";
    let y = 230;
    for (const w of words) {
      if (ctx.measureText(line + w).width > 860) {
        ctx.fillText(line, 60, y);
        line = "";
        y += 34;
      }
      line += w + " ";
    }
    ctx.fillText(line, 60, y);
    y += 70;
    ctx.fillStyle = "#a5f3e4";
    ctx.font = "600 26px sans-serif";
    ctx.fillText(`Micro-task: ${insight.taskTitle}`, 60, y);
    ctx.fillStyle = "#e5e0f5";
    ctx.font = "20px sans-serif";
    insight.taskSteps.forEach((s, i) => ctx.fillText(`${i + 1}. ${s}`, 60, y + 40 + i * 32));
    ctx.fillStyle = "#9d95c2";
    ctx.font = "16px sans-serif";
    ctx.fillText(
      "MindLoom provides wellness support, not medical diagnosis or clinical treatment.",
      60,
      570,
    );
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "mindloom-reflection.png";
    a.click();
    toast.success("Insight image downloaded");
  };

  const reset = () => {
    setJournal("");
    setTags([]);
    setInsight(null);
  };

  const handleExport = () => {
    if (!insight) {
      toast.info("Process a reflection first to export insights.");
      return;
    }
    downloadImage();
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <div className="ambient-orb animate-floaty -left-24 top-10 h-96 w-96 bg-primary" />
      <div className="ambient-orb animate-floaty right-0 top-1/3 h-[28rem] w-[28rem] bg-accent" />
      <div className="ambient-orb bottom-0 left-1/3 h-80 w-80 bg-aurora" />

      <TopNav onExport={handleExport} onReset={reset} />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Untangle the day, <span className="text-aurora">one thread at a time</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          A 60-second reflection becomes an emotion read, a compassionate insight, and a guided
          micro-reset built for high-pressure days.
        </p>

        <Tabs defaultValue="reflect" className="mt-6">
          <TabsList className="glass rounded-2xl p-1">
            <TabsTrigger value="reflect" className="rounded-xl px-5">
              Reflect
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-5">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reflect" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <JournalPanel
                value={journal}
                onChange={setJournal}
                tags={tags}
                onToggleTag={toggleTag}
                onSubmit={process}
                processing={streaming}
              />
              {insight ? (
                <InsightPanel
                  insight={insight}
                  streaming={streaming}
                  onCopy={copySummary}
                  onImage={downloadImage}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-5">
            <Analytics data={MOOD_DATA} streak={12} />
          </TabsContent>
        </Tabs>
      </main>

      <SafetyBanner />
      <Toaster />
    </div>
  );
}
