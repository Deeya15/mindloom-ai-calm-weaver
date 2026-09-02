export type ResetKind = "sprint" | "grounding" | "somatic" | "breath" | "sigh";

export type ResetPhase = { label: string; seconds: number };

export type ResetStep = {
  title: string;
  detail: string;
  seconds?: number;
};

export type ResetPreset = {
  kind: ResetKind;
  title: string;
  tagline: string;
  mode: "timer" | "steps" | "breath";
  duration: number;
  steps: ResetStep[];
  /** breath mode only — one full cycle */
  phases?: ResetPhase[];
  cycles?: number;
};

export const RESET_PRESETS: Record<ResetKind, ResetPreset> = {
  sprint: {
    kind: "sprint",
    title: "5-Minute Action Micro-Sprint",
    tagline: "Beat academic paralysis by shrinking the task until starting is easy.",
    mode: "timer",
    duration: 300,
    steps: [
      {
        title: "Name one tiny task",
        detail: "Pick the smallest concrete piece — one paragraph, five flashcards, one problem.",
        seconds: 30,
      },
      {
        title: "Clear the runway",
        detail: "Phone face-down, close every tab that isn't this task. Nothing else exists for 5 minutes.",
        seconds: 30,
      },
      {
        title: "Sprint — imperfect is fine",
        detail: "Work only on that piece. Messy output beats a blank page; you can refine later.",
        seconds: 210,
      },
      {
        title: "Mark the win",
        detail: "Write down what you finished. Momentum, not perfection, is the goal.",
        seconds: 30,
      },
    ],
  },
  grounding: {
    kind: "grounding",
    title: "5-4-3-2-1 Sensory Grounding",
    tagline: "Pull attention out of the overwhelm loop and back into the room.",
    mode: "steps",
    duration: 150,
    steps: [
      { title: "5 things you can see", detail: "Look slowly around and name five of them, out loud or in your head." },
      { title: "4 things you can feel", detail: "Chair, floor, fabric, temperature of the air on your skin." },
      { title: "3 things you can hear", detail: "Let the furthest sound in first, then the closest." },
      { title: "2 things you can smell", detail: "Or two scents you love, if the air is neutral." },
      { title: "1 thing you can taste", detail: "Or one slow sip of water. Finish with a long exhale." },
    ],
  },
  somatic: {
    kind: "somatic",
    title: "Somatic Drop & Muscle Release",
    tagline: "Burnout lives in held muscle — this discharges it from the top down.",
    mode: "steps",
    duration: 180,
    steps: [
      { title: "Drop the shoulders", detail: "Exhale and let them fall away from your ears. Feel the weight land.", seconds: 30 },
      { title: "Unclench jaw & face", detail: "Part your teeth slightly, soften the tongue, let the forehead go smooth.", seconds: 30 },
      { title: "Tense, then release", detail: "Squeeze fists and forearms for 5 seconds, then let go completely.", seconds: 40 },
      { title: "Legs and feet", detail: "Press feet into the floor for 5 seconds, release, and feel the heaviness.", seconds: 40 },
      { title: "Whole-body sigh", detail: "One long audible exhale. Let the body sag and stay there for a moment.", seconds: 40 },
    ],
  },
  breath: {
    kind: "breath",
    title: "4-7-8 Calming Breath",
    tagline: "A longer exhale tells the nervous system the alarm can stand down.",
    mode: "breath",
    duration: 152,
    cycles: 8,
    phases: [
      { label: "Inhale through the nose", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Exhale slowly through the mouth", seconds: 8 },
    ],
    steps: [
      { title: "Settle", detail: "Sit tall, tongue behind the top teeth, shoulders down." },
      { title: "Follow the pacer", detail: "Inhale 4, hold 7, exhale 8 — let the exhale be the longest part." },
      { title: "Eight cycles", detail: "If you get lightheaded, shorten the hold and keep the ratio." },
    ],
  },
  sigh: {
    kind: "sigh",
    title: "Physiological Sigh",
    tagline: "Two inhales, one long exhale — the fastest way to drop restless activation.",
    mode: "breath",
    duration: 120,
    cycles: 12,
    phases: [
      { label: "Inhale through the nose", seconds: 3 },
      { label: "Second short sip of air", seconds: 1 },
      { label: "Long exhale through the mouth", seconds: 6 },
    ],
    steps: [
      { title: "Double inhale", detail: "A full nose inhale, then a short extra sip on top." },
      { title: "Slow release", detail: "Long, unhurried exhale through the mouth until empty." },
      { title: "Repeat", detail: "Two to three rounds is often enough; keep going if it helps." },
    ],
  },
};

const TAG_TO_KIND: Record<string, ResetKind> = {
  "#academicstress": "sprint",
  "#overwhelmed": "grounding",
  "#burnout": "somatic",
  "#anxious": "breath",
  "#restless": "sigh",
  "#latenight": "breath",
  "#lonely": "grounding",
  "#hopeful": "sigh",
};

/** Chooses the technique from the selected context tags, then the detected emotion. */
export function resolveResetKind(
  emotion: string,
  tags: string[] = [],
  hinted?: string,
): ResetKind {
  const hint = (hinted ?? "").trim().toLowerCase();
  if (hint && hint in RESET_PRESETS) return hint as ResetKind;

  for (const t of tags) {
    const k = TAG_TO_KIND[t.trim().toLowerCase()];
    if (k) return k;
  }

  const e = emotion.toLowerCase();
  if (/academ|study|exam|deadline|procrast|stuck/.test(e)) return "sprint";
  if (/overwhelm|panic|flooded|scattered/.test(e)) return "grounding";
  if (/burn|exhaust|drained|numb|flat|depleted/.test(e)) return "somatic";
  if (/restless|wired|agitated|jittery/.test(e)) return "sigh";
  if (/anx|worried|nervous|tense|fear/.test(e)) return "breath";
  return "breath";
}

export function resolveReset(emotion: string, tags: string[] = [], hinted?: string): ResetPreset {
  return RESET_PRESETS[resolveResetKind(emotion, tags, hinted)];
}
