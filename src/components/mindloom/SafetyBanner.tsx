import { ShieldCheck } from "lucide-react";

export function SafetyBanner() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-center text-[12px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-calm" />
        MindLoom provides wellness support, not medical diagnosis or clinical treatment.
      </p>
    </div>
  );
}
