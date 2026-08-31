import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BreathTimer({ duration }: { duration: number }) {
  const [left, setLeft] = useState(duration);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(duration);
    setRunning(false);
  }, [duration]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const pct = duration ? ((duration - left) / duration) * 100 : 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const phase = !running ? "Ready" : left % 8 >= 4 ? "Breathe out…" : "Breathe in…";

  return (
    <div className="mt-4 flex items-center gap-5">
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
        <div
          className="ambient-orb inset-0 bg-primary"
          style={{ opacity: running ? 0.5 : 0.2 }}
        />
        <div
          className="bg-aurora absolute inset-2 rounded-full"
          style={{
            animation: running ? "breathe 8s ease-in-out infinite" : undefined,
            opacity: running ? 1 : 0.5,
          }}
        />
        <span className="relative font-display text-lg font-semibold text-primary-foreground">
          {mm}:{ss}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{left === 0 ? "Complete — well done." : phase}</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="bg-aurora h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
            {running ? "Pause" : left === 0 ? "Again" : "Start"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRunning(false);
              setLeft(duration);
            }}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
