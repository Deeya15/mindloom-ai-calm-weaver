import { useState } from "react";
import { Mic, Loader2, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EMOTION_TAGS } from "@/lib/mindloom";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  tags: string[];
  onToggleTag: (t: string) => void;
  onSubmit: () => void;
  processing: boolean;
};

export function JournalPanel({
  value,
  onChange,
  tags,
  onToggleTag,
  onSubmit,
  processing,
}: Props) {
  const [listening, setListening] = useState(false);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Today&apos;s reflection</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Write freely. Nothing is graded, nothing is judged.
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
          {words} words
        </span>
      </div>

      <div className="relative mt-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Three deadlines, no sleep, and I still feel behind…"
          className="min-h-[220px] resize-none rounded-2xl border-border/70 bg-background/40 p-4 text-base leading-relaxed focus-visible:ring-primary/60"
        />
        <button
          type="button"
          onClick={() => setListening((l) => !l)}
          aria-label={listening ? "Stop dictation" : "Start voice dictation"}
          className={cn(
            "absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-secondary/80 transition-all hover:scale-105",
            listening && "animate-pulse-ring border-primary/60 bg-primary/25",
          )}
        >
          {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>

      {listening && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-end gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="animate-breathe w-1 rounded-full bg-accent"
                style={{ height: 6 + i * 3, animationDelay: `${i * 0.12}s`, ["--breath-duration" as string]: "1.6s" }}
              />
            ))}
          </span>
          Listening… (demo dictation, type to continue)
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Context tags
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {EMOTION_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:-translate-y-0.5",
                  active
                    ? "border-primary/60 bg-primary/25 text-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={processing || !value.trim()}
        className="bg-aurora mt-6 h-12 w-full rounded-2xl text-base font-semibold text-primary-foreground transition-all hover:opacity-95 hover:shadow-[var(--shadow-glow)] disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Weaving your reflection…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Process Reflection
          </>
        )}
      </Button>
    </section>
  );
}
