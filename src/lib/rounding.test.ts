import { describe, expect, it } from 'vitest';
import {
  normalizeAnswer,
  pickReplyIndex,
  shiftFromHour,
  simulatedConfidence,
  structuredReplyFor,
} from '@/lib/rounding';
import { ROUNDING_QUESTIONS, STRUCTURED_REPLIES } from '@/data/clinical';
import type { RoundingQuestion } from '@/types/clinical';

const painQuestion = ROUNDING_QUESTIONS.find((q) => q.id === 'q-pain') as RoundingQuestion;

describe('shiftFromHour', () => {
  it('maps the hour of day to the working shift', () => {
    expect(shiftFromHour(7)).toBe('Day');
    expect(shiftFromHour(11)).toBe('Day');
    expect(shiftFromHour(14)).toBe('Day');
    expect(shiftFromHour(15)).toBe('Evening');
    expect(shiftFromHour(22)).toBe('Evening');
    expect(shiftFromHour(23)).toBe('Night');
    expect(shiftFromHour(0)).toBe('Night');
    expect(shiftFromHour(6)).toBe('Night');
  });
});

describe('pickReplyIndex', () => {
  it('is deterministic and stays within the reply range', () => {
    expect(pickReplyIndex(painQuestion, 0)).toBe(0);
    expect(pickReplyIndex(painQuestion, 1)).toBe(1);
    expect(pickReplyIndex(painQuestion, 2)).toBe(2);
    expect(pickReplyIndex(painQuestion, 3)).toBe(0);
    for (let seed = 0; seed < 50; seed += 1) {
      const idx = pickReplyIndex(painQuestion, seed);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(painQuestion.sampleReplies.length);
    }
  });

  it('returns 0 when a question has no sample replies', () => {
    const empty: RoundingQuestion = { ...painQuestion, sampleReplies: [] };
    expect(pickReplyIndex(empty, 7)).toBe(0);
  });
});

describe('simulatedConfidence', () => {
  it('produces a plausible STT confidence in [0.88, 0.99]', () => {
    expect(simulatedConfidence(0)).toBeCloseTo(0.88, 5);
    for (let seed = 0; seed < 50; seed += 1) {
      const c = simulatedConfidence(seed);
      expect(c).toBeGreaterThanOrEqual(0.88);
      expect(c).toBeLessThanOrEqual(0.99);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(simulatedConfidence(13)).toBe(simulatedConfidence(13));
  });
});

describe('structuredReplyFor', () => {
  it('returns the chart phrase aligned with the reply index', () => {
    expect(structuredReplyFor(painQuestion, 0, 'raw')).toBe(STRUCTURED_REPLIES['q-pain'][0]);
    expect(structuredReplyFor(painQuestion, 2, 'raw')).toBe(STRUCTURED_REPLIES['q-pain'][2]);
  });

  it('falls back to the first phrase, then the raw transcript', () => {
    const unknown: RoundingQuestion = { ...painQuestion, id: 'q-unknown' };
    expect(structuredReplyFor(unknown, 0, 'raw transcript')).toBe('raw transcript');
    expect(structuredReplyFor(painQuestion, 99, 'raw')).toBe(STRUCTURED_REPLIES['q-pain'][0]);
  });
});

describe('normalizeAnswer', () => {
  it('turns a transcribed reply into a chart-ready structured answer', () => {
    const answer = normalizeAnswer(painQuestion, 2, '수술 부위가 욱신거려요', 0.91, '2026-06-27T08:00:00.000Z');
    expect(answer).toEqual({
      questionId: 'q-pain',
      category: 'pain',
      prompt: painQuestion.prompt,
      transcript: '수술 부위가 욱신거려요',
      confidence: 0.91,
      structured: STRUCTURED_REPLIES['q-pain'][2],
      answeredAt: '2026-06-27T08:00:00.000Z',
    });
  });

  it('keeps the raw transcript as the structured phrase when no mapping exists', () => {
    const unknown: RoundingQuestion = { ...painQuestion, id: 'q-unknown' };
    const answer = normalizeAnswer(unknown, 0, 'free speech', 0.8, '2026-06-27T08:00:00.000Z');
    expect(answer.structured).toBe('free speech');
  });

  it('defaults answeredAt to the current time when omitted', () => {
    const before = Date.now();
    const answer = normalizeAnswer(painQuestion, 0, 'no pain', 0.95);
    const stamped = new Date(answer.answeredAt).getTime();
    expect(stamped).toBeGreaterThanOrEqual(before);
    expect(stamped).toBeLessThanOrEqual(Date.now());
  });
});
