import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { buildDataset } from '@/data/generate';
import { bmi, bradenRisk, computeLabFlag, morseRisk } from '@/lib/clinical';

faker.seed(424242);
const dataset = buildDataset(16);
const patientIds = new Set(dataset.patients.map((p) => p.id));

describe('buildDataset', () => {
  it('produces the requested number of patients with unique, padded ids', () => {
    expect(dataset.patients).toHaveLength(16);
    expect(patientIds.size).toBe(16);
    expect(dataset.patients[0].id).toBe('pt-001');
    expect(dataset.patients[15].id).toBe('pt-016');
  });

  it('derives each patient BMI from height and weight', () => {
    for (const p of dataset.patients) {
      expect(p.bmi).toBe(bmi(p.heightCm, p.weightKg));
    }
  });

  it('flags every lab value against its own reference interval', () => {
    for (const p of dataset.patients) {
      for (const lab of p.labs) {
        expect(lab.flag).toBe(computeLabFlag(lab.value, lab.refLow, lab.refHigh));
      }
    }
  });

  it('keeps assessment-scale totals and risk bands internally consistent', () => {
    for (const p of dataset.patients) {
      const { braden, morse, gcs } = p.scales;

      const bradenSum =
        braden.sensoryPerception +
        braden.moisture +
        braden.activity +
        braden.mobility +
        braden.nutrition +
        braden.frictionShear;
      expect(braden.total).toBe(bradenSum);
      expect(braden.risk).toBe(bradenRisk(braden.total));

      const morseSum =
        morse.history +
        morse.secondaryDiagnosis +
        morse.ambulatoryAid +
        morse.ivTherapy +
        morse.gait +
        morse.mentalStatus;
      expect(morse.total).toBe(morseSum);
      expect(morse.risk).toBe(morseRisk(morse.total));

      expect(gcs.total).toBe(gcs.eye + gcs.verbal + gcs.motor);
    }
  });

  it('derives banner flags from the underlying clinical state', () => {
    for (const p of dataset.patients) {
      expect(p.flags.includes('Allergy')).toBe(p.allergies.length > 0);
      expect(p.flags.includes('NPO')).toBe(p.diet === 'NPO');
      expect(p.flags.includes('Fall Risk')).toBe(p.scales.morse.risk === 'high');
    }
  });

  it('only references existing patients from records and schedule', () => {
    for (const record of dataset.records) {
      expect(patientIds.has(record.patientId)).toBe(true);
    }
    for (const round of dataset.schedule) {
      expect(patientIds.has(round.patientId)).toBe(true);
    }
  });

  it('is reproducible for a fixed seed', () => {
    faker.seed(1);
    const a = buildDataset(4);
    faker.seed(1);
    const b = buildDataset(4);
    expect(a.patients.map((p) => p.mrn)).toEqual(b.patients.map((p) => p.mrn));
    expect(a.patients.map((p) => p.bmi)).toEqual(b.patients.map((p) => p.bmi));
  });
});
