import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `You are MindLoom AI, a warm, evidence-informed well-being reflection companion.
You never diagnose, never mention medication, and never claim to be a therapist.
Given a person's journal entry, respond ONLY in this exact line protocol, nothing else:

EMOTION: <one or two words, e.g. Overwhelmed>
CONFIDENCE: <integer 50-99>
INSIGHT: <exactly two compassionate sentences on one line, no line breaks>
TASK: <short name of a 1-minute mindfulness or breathing routine>
STEP: <step one>
STEP: <step two>
STEP: <step three>
DURATION: 60

If the entry suggests risk of self-harm, keep the tone gentle and make the INSIGHT encourage
reaching out to a trusted person or local crisis line.`;

export const Route = createFileRoute("/api/insight")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          journal?: string;
          tags?: string[];
        };
        const journal = (body.journal ?? "").slice(0, 4000).trim();
        if (!journal) return new Response("Empty journal", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI unavailable", { status: 503 });

        const userContent = body.tags?.length
          ? `${journal}\n\nContext tags: ${body.tags.join(", ")}`
          : journal;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
          },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: userContent },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          return new Response(detail || "AI gateway error", { status: upstream.status || 502 });
        }

        // Re-emit only the assistant text deltas as a plain text stream.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        const stream = new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta)
                  controller.enqueue(encoder.encode(delta));
              } catch {
                /* ignore partial frames */
              }
            }
          },
        });

        return new Response(upstream.body.pipeThrough(stream), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
