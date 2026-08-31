export type Insight = {
  emotion: string;
  confidence: number;
  insight: string;
  taskTitle: string;
  taskSteps: string[];
  duration: number;
};

export const EMPTY_INSIGHT: Insight = {
  emotion: "",
  confidence: 0,
  insight: "",
  taskTitle: "",
  taskSteps: [],
  duration: 60,
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
    const v = value.trim();
    if (key === "EMOTION") out.emotion = v;
    else if (key === "CONFIDENCE") out.confidence = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
    else if (key === "INSIGHT") out.insight = v;
    else if (key === "TASK") out.taskTitle = v;
    else if (key === "STEP" && v) out.taskSteps.push(v.replace(/^[-•]\s*/, ""));
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
    taskTitle: "Box breathing reset",
    taskSteps: [
      "Sit back and unclench your jaw and shoulders",
      "Inhale for 4, hold for 4, exhale for 4, hold for 4",
      "Repeat the square until the timer completes",
    ],
    duration: 60,
  },
  {
    emotion: "Anxious",
    confidence: 81,
    insight:
      "Your mind seems to be rehearsing outcomes that haven't happened yet, which keeps your body on alert. That vigilance is trying to protect you, even though it's costing you rest.",
    taskTitle: "5-4-3-2-1 grounding",
    taskSteps: [
      "Name 5 things you can see and 4 you can touch",
      "Notice 3 sounds, 2 scents, 1 taste",
      "Finish with one slow exhale, longer than the inhale",
    ],
    duration: 60,
  },
  {
    emotion: "Burnout",
    confidence: 78,
    insight:
      "The flatness you describe often shows up after long stretches of output with little recovery. Rest here isn't a reward for finishing — it's the fuel that makes finishing possible.",
    taskTitle: "Physiological sigh",
    taskSteps: [
      "Take a normal inhale, then a short second sip of air",
      "Release one long, slow exhale through the mouth",
      "Repeat gently for the full minute",
    ],
    duration: 60,
  },
];

export function mockInsight(text: string): Insight {
  const lower = text.toLowerCase();
  if (/tired|exhaust|drained|burn/.test(lower)) return MOCKS[2];
  if (/worry|anxious|panic|nervous|scared/.test(lower)) return MOCKS[1];
  return MOCKS[0];
}

export function insightToProtocol(i: Insight): string {
  return [
    `EMOTION: ${i.emotion}`,
    `CONFIDENCE: ${i.confidence}`,
    `INSIGHT: ${i.insight}`,
    `TASK: ${i.taskTitle}`,
    ...i.taskSteps.map((s) => `STEP: ${s}`),
    `DURATION: ${i.duration}`,
  ].join("\n");
}

export function insightToSummary(i: Insight, journal: string): string {
  return [
    "MindLoom AI — Reflection Summary",
    "",
    `Primary emotion: ${i.emotion} (${i.confidence}% confidence)`,
    "",
    "Empathetic insight:",
    i.insight,
    "",
    `Micro-task: ${i.taskTitle} (${i.duration}s)`,
    ...i.taskSteps.map((s, n) => `  ${n + 1}. ${s}`),
    "",
    "Journal entry:",
    journal,
    "",
    "MindLoom provides wellness support, not medical diagnosis or clinical treatment.",
  ].join("\n");
}
