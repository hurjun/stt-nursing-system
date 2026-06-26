import { STRUCTURED_REPLIES } from '@/data/clinical';
import type { RoundingAnswer, RoundingQuestion, Shift } from '@/types/clinical';

/**
 * Pure logic for the voice-rounds workflow: turning a bedside spoken reply into
 * a chart-ready, structured nursing record. The thesis idea is that free speech
 * captured by STT is normalized into a concise documentation phrase before it is
 * written to the chart — that normalization lives here so it can be unit-tested
 * independently of the React page that drives it.
 */

/** Derives the working shift from the hour of day (matches the seed convention). */
export function shiftFromHour(hour: number): Shift {
  if (hour >= 7 && hour < 15) return 'Day';
  if (hour >= 15 && hour < 23) return 'Evening';
  return 'Night';
}

/**
 * Picks a deterministic-feeling but varied sample-reply index for the bedside
 * simulation. Stable for a given question/seed so the demo is reproducible.
 */
export function pickReplyIndex(question: RoundingQuestion, seed: number): number {
  const n = question.sampleReplies.length;
  if (n === 0) return 0;
  return (seed * 7 + 3) % n;
}

/** A realistic STT confidence around 0.9, jittered per answer and capped at 0.99. */
export function simulatedConfidence(seed: number): number {
  const jitter = ((seed * 37) % 11) / 100; // 0.00 – 0.10
  return Math.min(0.99, 0.88 + jitter);
}

/**
 * Resolves the structured, chart-ready phrasing for a captured answer, aligned
 * by index with the question's sample replies. Falls back to the first
 * structured phrase, then to the raw transcript, so a record is never empty.
 */
export function structuredReplyFor(
  question: RoundingQuestion,
  replyIndex: number,
  transcript: string,
): string {
  const phrases = STRUCTURED_REPLIES[question.id];
  return phrases?.[replyIndex] ?? phrases?.[0] ?? transcript;
}

/**
 * Normalizes a transcribed bedside reply into a structured {@link RoundingAnswer}.
 * `answeredAt` is injectable so the transform is deterministic under test.
 */
export function normalizeAnswer(
  question: RoundingQuestion,
  index: number,
  transcript: string,
  confidence: number,
  answeredAt: string = new Date().toISOString(),
): RoundingAnswer {
  const replyIndex = pickReplyIndex(question, index);
  return {
    questionId: question.id,
    category: question.category,
    prompt: question.prompt,
    transcript,
    confidence,
    structured: structuredReplyFor(question, replyIndex, transcript),
    answeredAt,
  };
}
