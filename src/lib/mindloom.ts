import { resolveReset } from "./resets";

export type Insight = {
  emotion: string;
  confidence: number;
  insight: string;
  taskTitle: string;
  taskSteps: string[];
  duration: number;
  /** technique hint emitted by the model (sprint | grounding | somatic | breath | sigh) */
  resetKind: string;
};

export const EMPTY_INSIGHT: Insight = {
  emotion: "",
  confidence: 0,
  insight: "",
  taskTitle: "",
  taskSteps: [],
  duration: 60,
  resetKind: "",
};

export const EMOTION_TAGS = [
  "#AcademicStress",
  "#Overwhelmed",
  "#Burnout",
  "#LateNight",
  "#Anxious",
  "#Lonely",
  "#Hopeful",
  "#Restless",
];

/**
 * Parses the streamed, line-delimited protocol emitted by the model:
 * EMOTION: / CONFIDENCE: / INSIGHT: / TASK: / STEP: / DURATION:
 * Safe to call on partial text while streaming.
 */
export function parseInsight(raw: string): Insight {
  const out: Insight = { ...EMPTY_INSIGHT, taskSteps: [] };
  for (const line of raw.split("\n")) {
    const [, key, value] = line.match(/^\s*([A-Z_]+)\s*:\s*(.*)$/) ?? [];
    if (!key) continue;
    const v = (value ?? "").trim();
    if (key === "EMOTION") out.emotion = v;
    else if (key === "CONFIDENCE") out.confidence = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
    else if (key === "INSIGHT") out.insight = v;
    else if (key === "TASK") out.taskTitle = v;
    else if (key === "STEP" && v) out.taskSteps.push(v.replace(/^[-•]\s*/, ""));
    else if (key === "RESET") out.resetKind = v.toLowerCase();
    else if (key === "DURATION") out.duration = Math.max(20, Math.min(300, parseInt(v, 10) || 60));
  }
  return out;
}

const MOCKS: Insight[] = [
  {
    emotion: "Overwhelmed",
    confidence: 87,
    insight:
      "It sounds like your day arrived faster than you could meet it, and the weight of everything at once is real. Carrying that much without pause would tire anyone — this is load, not weakness.",
    taskTitle: "",
    taskSteps: [],
    duration: 60,
    resetKind: "grounding",
  },
  {
    emotion: "Anxious",
    confidence: 81,
    insight:
      "Your mind seems to be rehearsing outcomes that haven't happened yet, which keeps your body on alert. That vigilance is trying to protect you, even though it's costing you rest.",
    taskTitle: "",
    taskSteps: [],
    duration: 60,
    resetKind: "breath",
  },
  {
    emotion: "Burnout",
    confidence: 78,
    insight:
      "The flatness you describe often shows up after long stretches of output with little recovery. Rest here isn't a reward for finishing — it's the fuel that makes finishing possible.",
    taskTitle: "",
    taskSteps: [],
    duration: 60,
    resetKind: "somatic",
  },
  {
    emotion: "Academic Stress",
    confidence: 84,
    insight:
      "The workload has grown big enough that starting anywhere feels like starting everywhere. Your focus isn't broken — the task just hasn't been cut small enough yet.",
    taskTitle: "",
    taskSteps: [],
    duration: 60,
    resetKind: "sprint",
  },
  {
    emotion: "Restless",
    confidence: 76,
    insight:
      "There's energy moving through you with nowhere to land, which can feel like being wired and stuck at the same time. Your body is asking for a release valve, not more control.",
    taskTitle: "",
    taskSteps: [],
    duration: 60,
    resetKind: "sigh",
  },
];

export function mockInsight(text: string, tags: string[] = []): Insight {
  const lower = text.toLowerCase();
  const byKind: Record<string, Insight> = {
    grounding: MOCKS[0]!,
    breath: MOCKS[1]!,
    somatic: MOCKS[2]!,
    sprint: MOCKS[3]!,
    sigh: MOCKS[4]!,
  };
  if (tags.length) {
    const kind = resolveReset("", tags).kind as string;
    if (byKind[kind]) return byKind[kind]!;
  }
  if (/assignment|exam|study|deadline|thesis|homework|procrast/.test(lower)) return MOCKS[3]!;
  if (/tired|exhaust|drained|burn|numb/.test(lower)) return MOCKS[2]!;
  if (/restless|wired|fidget|can.t sit/.test(lower)) return MOCKS[4]!;
  if (/worry|anxious|panic|nervous|scared/.test(lower)) return MOCKS[1]!;
  return MOCKS[0]!;
}

export function insightToProtocol(i: Insight): string {
  return [
    `EMOTION: ${i.emotion}`,
    `CONFIDENCE: ${i.confidence}`,
    `INSIGHT: ${i.insight}`,
    `RESET: ${i.resetKind}`,
    `DURATION: ${i.duration}`,
  ].join("\n");
}

export function insightToSummary(i: Insight, journal: string, tags: string[] = []): string {
  const preset = resolveReset(i.emotion, tags, i.resetKind);
  return [
    "MindLoom AI — Reflection Summary",
    "",
    `Primary emotion: ${i.emotion} (${i.confidence}% confidence)`,
    "",
    "Empathetic insight:",
    i.insight,
    "",
    `Micro-reset: ${preset.title} (${Math.round(preset.duration / 60)} min)`,
    preset.tagline,
    ...preset.steps.map((s, n) => `  ${n + 1}. ${s.title} — ${s.detail}`),
    "",
    "Journal entry:",
    journal,
    "",
    "MindLoom provides wellness support, not medical diagnosis or clinical treatment.",
  ].join("\n");
}
