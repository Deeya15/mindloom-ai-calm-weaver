import { Brain, Sparkles, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav({ onExport, onReset }: { onExport: () => void; onReset: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="bg-aurora flex h-9 w-9 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold tracking-tight">MindLoom AI</p>
            <p className="text-[11px] text-muted-foreground">Reflect · Understand · Reset</p>
          </div>
        </div>

        <span className="ml-2 hidden items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium text-foreground sm:inline-flex">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-calm opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-calm" />
          </span>
          Gemini 1.5 Powered
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">New entry</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={onExport} className="gap-1.5">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="gap-1.5 bg-aurora text-primary-foreground hover:opacity-90">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Pro</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
