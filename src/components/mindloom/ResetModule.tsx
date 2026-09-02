import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResetPreset } from "@/lib/resets";

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Countdown ring + label used by every mode. */
function Dial({
  running,
  label,
  pct,
  breathScale,
}: {
  running: boolean;
  label: string;
  pct: number;
  breathScale?: number;
}) {
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <div className="ambient-orb inset-0 bg-primary" style={{ opacity: running ? 0.5 : 0.2 }} />
      <div
        className="bg-aurora absolute inset-2 rounded-full transition-transform duration-1000 ease-in-out"
        style={{
          opacity: running ? 1 : 0.5,
          transform: `scale(${breathScale ?? 1})`,
        }}
      />
      <span className="relative font-display text-lg font-semibold text-primary-foreground">
        {label}
      </span>
      <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 295} 295`}
          opacity={0.9}
        />
      </svg>
    </div>
  );
}

export function ResetModule({ preset }: { preset: ResetPreset }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    setRunning(false);
    setElapsed(0);
    setStep(0);
    setDone([]);
  }, [preset.kind]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const total = preset.duration;
  const complete = elapsed >= total;
  useEffect(() => {
    if (complete) setRunning(false);
  }, [complete]);

  // Timer mode: which step the elapsed time falls into.
  const timerStep = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < preset.steps.length; i++) {
      acc += preset.steps[i]?.seconds ?? 0;
      if (elapsed < acc) return i;
    }
    return preset.steps.length - 1;
  }, [elapsed, preset.steps]);

  // Breath mode: current phase within the repeating cycle.
  const breath = useMemo(() => {
    const phases = preset.phases ?? [];
    if (!phases.length) return null;
    const cycleLen = phases.reduce((a, p) => a + p.seconds, 0);
    const inCycle = elapsed % cycleLen;
    let acc = 0;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i]!;
      acc += p.seconds;
      if (inCycle < acc) {
        return {
          index: i,
          label: p.label,
          left: acc - inCycle,
          cycle: Math.floor(elapsed / cycleLen) + 1,
          scale: /inhale|sip/i.test(p.label) ? 1.12 : /hold/i.test(p.label) ? 1.12 : 0.82,
        };
      }
    }
    return null;
  }, [elapsed, preset.phases]);

  const pct = Math.min(100, (elapsed / total) * 100);
  const active = preset.mode === "timer" ? timerStep : step;

  const dialLabel =
    preset.mode === "breath" && running && breath
      ? String(breath.left)
      : fmt(Math.max(0, total - elapsed));

  const statusLine = complete
    ? "Complete — notice how your body feels now."
    : preset.mode === "breath"
      ? running && breath
        ? `${breath.label} · cycle ${Math.min(breath.cycle, preset.cycles ?? 99)}`
        : "Ready when you are"
      : preset.mode === "timer"
        ? running
          ? `Step ${timerStep + 1} of ${preset.steps.length} · ${preset.steps[timerStep]?.title}`
          : "Ready — start when your task is chosen"
        : `Step ${step + 1} of ${preset.steps.length}`;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-5">
        <Dial
          running={running}
          label={dialLabel}
          pct={pct}
          breathScale={running && breath ? breath.scale : 1}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{statusLine}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-aurora h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
              {running ? "Pause" : complete ? "Again" : "Start"}
            </Button>
            {preset.mode === "steps" && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={step >= preset.steps.length - 1}
                  onClick={() => {
                    setDone((d) => (d.includes(step) ? d : [...d, step]));
                    setStep((s) => Math.min(preset.steps.length - 1, s + 1));
                  }}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRunning(false);
                setElapsed(0);
                setStep(0);
                setDone([]);
              }}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {preset.steps.map((s, i) => {
          const isActive = i === active;
          const isDone = preset.mode === "steps" ? done.includes(i) : i < active;
          return (
            <li
              key={s.title}
              className={`flex gap-3 rounded-2xl border p-3 transition-all duration-500 ${
                isActive
                  ? "border-accent/50 bg-accent/10 shadow-[var(--shadow-glow)]"
                  : "border-border/60 bg-secondary/30 opacity-70"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive || isDone
                    ? "bg-aurora text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {s.title}
                  {s.seconds ? (
                    <span className="ml-2 text-xs text-muted-foreground">{s.seconds}s</span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
