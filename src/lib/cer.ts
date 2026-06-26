/**
 * Character Error Rate (CER) — the metric the underlying thesis used to compare
 * Korean speech-to-text engines. CER is the edit distance between a recognized
 * hypothesis and the reference utterance, divided by the reference length.
 *
 * The thesis reports these numbers as a table (see `data/clinical/research.ts`);
 * implementing the metric here makes the headline "0% CER on the reference
 * utterance" reproducible from code rather than merely asserted.
 */

/** Levenshtein (character-level) edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const aChars = Array.from(a);
  const bChars = Array.from(b);
  let prev = Array.from({ length: bChars.length + 1 }, (_, i) => i);
  let curr = new Array<number>(bChars.length + 1);

  for (let i = 1; i <= aChars.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= bChars.length; j += 1) {
      const cost = aChars[i - 1] === bChars[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[bChars.length];
}

/**
 * Normalizes text for CER scoring by removing whitespace and punctuation, so the
 * score reflects spoken content rather than spacing or punctuation differences.
 */
export function normalizeForCer(text: string): string {
  return text.replace(/[\s\p{P}\p{S}]/gu, '');
}

/** Number of character edits between a reference and a recognized hypothesis. */
export function characterErrors(reference: string, hypothesis: string): number {
  return levenshtein(normalizeForCer(reference), normalizeForCer(hypothesis));
}

/**
 * Character Error Rate as a percentage. An empty reference yields 0% when the
 * hypothesis is also empty, otherwise 100%.
 */
export function characterErrorRate(reference: string, hypothesis: string): number {
  const ref = normalizeForCer(reference);
  const hyp = normalizeForCer(hypothesis);
  if (ref.length === 0) return hyp.length === 0 ? 0 : 100;
  return (levenshtein(ref, hyp) / ref.length) * 100;
}
