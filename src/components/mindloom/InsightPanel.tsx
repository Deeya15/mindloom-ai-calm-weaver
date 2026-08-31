import { HeartHandshake, Waves, Activity, Copy, ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreathTimer } from "./BreathTimer";
import type { Insight } from "@/lib/mindloom";

function Card({
  icon,
  label,
  children,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="glass-glow animate-in fade-in slide-in-from-bottom-4 rounded-3xl p-5 duration-700 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="glass flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-8 text-center">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="ambient-orb inset-0 bg-accent" />
        <span className="animate-breathe bg-aurora absolute inset-6 rounded-full opacity-70" />
        <Waves className="relative h-8 w-8 text-primary-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">Your insight panel is quiet</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Write a reflection on the left and MindLoom will surface your emotion, a compassionate
        read, and a one-minute reset.
      </p>
    </div>
  );
}

export function InsightPanel({
  insight,
  streaming,
  onCopy,
  onImage,
}: {
  insight: Insight;
  streaming: boolean;
  onCopy: () => void;
  onImage: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card
        delay={0}
        icon={<Activity className="h-3.5 w-3.5" />}
        label="Primary emotion detected"
      >
        <div className="flex items-center gap-3">
          <span className="animate-in zoom-in bg-aurora rounded-full px-4 py-1.5 font-display text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] duration-500">
            {insight.emotion || (streaming ? "…" : "Unnamed")}
          </span>
          <span className="text-sm text-muted-foreground">{insight.confidence}% confidence</span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="bg-aurora h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${insight.confidence}%` }}
          />
        </div>
      </Card>

      <Card
        delay={120}
        icon={<HeartHandshake className="h-3.5 w-3.5" />}
        label="Empathetic insight"
      >
        <p className="text-[15px] leading-relaxed text-foreground/90">
          {insight.insight || (streaming ? "Listening closely…" : "")}
          {streaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" />}
        </p>
      </Card>

      <Card delay={240} icon={<Waves className="h-3.5 w-3.5" />} label="Actionable micro-task">
        <p className="font-display text-base font-semibold">
          {insight.taskTitle || (streaming ? "Preparing a reset…" : "")}
        </p>
        <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {insight.taskSteps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {!streaming && insight.taskTitle && <BreathTimer duration={insight.duration} />}
      </Card>

      {!streaming && insight.emotion && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={onCopy}>
            <Copy className="h-4 w-4" /> Copy summary
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={onImage}>
            <ImageDown className="h-4 w-4" /> Download image
          </Button>
        </div>
      )}
    </div>
  );
}
