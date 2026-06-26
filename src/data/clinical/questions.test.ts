import { describe, expect, it } from 'vitest';
import {
  QUESTION_SETS,
  ROUNDING_QUESTIONS,
  STRUCTURED_REPLIES,
} from '@/data/clinical';

const questionIds = new Set(ROUNDING_QUESTIONS.map((q) => q.id));

describe('rounding question catalog', () => {
  it('has unique, non-empty question ids', () => {
    expect(questionIds.size).toBe(ROUNDING_QUESTIONS.length);
    for (const q of ROUNDING_QUESTIONS) {
      expect(q.id).toBeTruthy();
    }
  });

  it('provides bilingual prompts and sample replies for every question', () => {
    for (const q of ROUNDING_QUESTIONS) {
      expect(q.prompt.en).toBeTruthy();
      expect(q.prompt.ko).toBeTruthy();
      expect(q.sampleReplies.length).toBeGreaterThan(0);
      for (const reply of q.sampleReplies) {
        expect(reply.en).toBeTruthy();
        expect(reply.ko).toBeTruthy();
      }
    }
  });

  it('aligns structured chart phrases with each question by index', () => {
    for (const q of ROUNDING_QUESTIONS) {
      const structured = STRUCTURED_REPLIES[q.id];
      expect(structured, `missing STRUCTURED_REPLIES for ${q.id}`).toBeDefined();
      expect(structured).toHaveLength(q.sampleReplies.length);
      for (const phrase of structured) {
        expect(phrase).toBeTruthy();
      }
    }
  });

  it('does not declare structured replies for unknown questions', () => {
    for (const id of Object.keys(STRUCTURED_REPLIES)) {
      expect(questionIds.has(id)).toBe(true);
    }
  });

  it('only references existing questions from every question set', () => {
    expect(QUESTION_SETS.length).toBeGreaterThan(0);
    for (const set of QUESTION_SETS) {
      expect(set.questionIds.length).toBeGreaterThan(0);
      for (const id of set.questionIds) {
        expect(questionIds.has(id)).toBe(true);
      }
    }
  });
});
