import { describe, expect, it } from 'vitest';
import {
  characterErrorRate,
  characterErrors,
  levenshtein,
  normalizeForCer,
} from '@/lib/cer';
import { STT_BENCHMARKS, STT_REFERENCE_UTTERANCE } from '@/data/clinical';

describe('levenshtein', () => {
  it('computes the classic edit-distance examples', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('flaw', 'lawn')).toBe(2);
    expect(levenshtein('same', 'same')).toBe(0);
  });

  it('handles empty strings', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('', '')).toBe(0);
  });

  it('counts a single Korean syllable substitution as one edit', () => {
    expect(levenshtein('학생입니다', '학셍입니다')).toBe(1);
  });
});

describe('normalizeForCer', () => {
  it('strips whitespace and punctuation', () => {
    expect(normalizeForCer('a b.c!')).toBe('abc');
    expect(normalizeForCer('안녕하세요 여름입니다.')).toBe('안녕하세요여름입니다');
  });
});

describe('characterErrorRate', () => {
  it('is zero for an exact match and scales with edits', () => {
    expect(characterErrorRate('abc', 'abc')).toBe(0);
    expect(characterErrorRate('abc', 'abd')).toBeCloseTo(33.33, 2);
  });

  it('handles empty references', () => {
    expect(characterErrorRate('', '')).toBe(0);
    expect(characterErrorRate('', 'x')).toBe(100);
  });
});

/**
 * Reproducibility of the thesis STT benchmark table. Rather than trusting the
 * hardcoded numbers, we recompute them from the implemented metric.
 */
describe('STT benchmark reproducibility', () => {
  const refLength = normalizeForCer(STT_REFERENCE_UTTERANCE).length;

  it('uses a non-trivial reference utterance', () => {
    expect(refLength).toBeGreaterThan(0);
  });

  it('reproduces each published CER from its character-error count and the reference length', () => {
    for (const row of STT_BENCHMARKS) {
      expect(row.cer).toBeCloseTo((row.characterErrors / refLength) * 100, 1);
    }
  });

  it('confirms the recommended engine transcribes the reference with zero errors', () => {
    const best = STT_BENCHMARKS.find((row) => row.recommended);
    expect(best).toBeDefined();
    expect(characterErrors(STT_REFERENCE_UTTERANCE, best!.recognized)).toBe(0);
    expect(characterErrorRate(STT_REFERENCE_UTTERANCE, best!.recognized)).toBe(0);
  });

  it('marks the lowest-CER engine as recommended', () => {
    const minCer = Math.min(...STT_BENCHMARKS.map((row) => row.cer));
    const recommended = STT_BENCHMARKS.filter((row) => row.recommended);
    expect(recommended).toHaveLength(1);
    expect(recommended[0].cer).toBe(minCer);
  });
});
