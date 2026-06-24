import { faker } from '@faker-js/faker';
import { buildDataset, type Dataset } from './generate';

let cached: Dataset | null = null;

/**
 * Returns the synthetic dataset for the session. A fixed seed keeps the roster,
 * names and clinical values stable across reloads so the demo is reproducible,
 * while admission and event times remain anchored to "now".
 */
export function getInitialDataset(): Dataset {
  if (!cached) {
    faker.seed(20250624);
    cached = buildDataset(24);
  }
  return cached;
}
