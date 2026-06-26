import { faker } from '@faker-js/faker';
import {
  ATTENDINGS,
  GIVEN_FEMALE,
  GIVEN_MALE,
  NURSE_NAMES,
  SURNAMES,
} from './names';
import {
  DIAGNOSES,
  LAB_CATALOG,
  MEDICATIONS,
  NANDA_LIBRARY,
  QUESTION_SETS,
  ROUNDING_QUESTIONS,
  STRUCTURED_REPLIES,
  WARDS,
  type DiagnosisTemplate,
} from './clinical';
import {
  bmi as computeBmi,
  bradenRisk,
  computeLabFlag,
  morseRisk,
} from '@/lib/clinical';
import type {
  Acuity,
  AssessmentScales,
  CarePlanTask,
  Diagnosis,
  IntakeOutput,
  LabResult,
  MarEntry,
  Medication,
  NandaDiagnosis,
  Nurse,
  Patient,
  NursingRecord,
  RoundingAnswer,
  RoundingSession,
  ScheduledRound,
  Shift,
  VitalSample,
  Ward,
} from '@/types/clinical';

const HOUR = 3_600_000;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function shiftForHour(hour: number): Shift {
  if (hour >= 7 && hour < 15) return 'Day';
  if (hour >= 15 && hour < 23) return 'Evening';
  return 'Night';
}

function uid(prefix: string): string {
  return `${prefix}-${faker.string.alphanumeric(8).toLowerCase()}`;
}

/* ----------------------------- name helpers ----------------------------- */

function buildName(sex: 'male' | 'female') {
  const surname = faker.helpers.arrayElement(SURNAMES);
  const given = faker.helpers.arrayElement(sex === 'male' ? GIVEN_MALE : GIVEN_FEMALE);
  return {
    name: `${surname.en} ${given.en}`,
    nameKo: `${surname.ko}${given.ko}`,
    initials: `${surname.en[0]}${given.en[0]}`.toUpperCase(),
  };
}

/* ------------------------------ diagnoses ------------------------------- */

function pickDiagnoses(specialty: string): Diagnosis[] {
  // Ward specialties (e.g. "General Surgery") may not match catalog specialties
  // (e.g. "Surgery") verbatim, so normalize and always fall back to a non-empty pool.
  const norm = specialty.includes('Surgery') ? 'Surgery' : specialty;
  const candidates = DIAGNOSES.filter((d) => d.specialty === norm);
  const primaryPool = candidates.length > 0 ? candidates : DIAGNOSES.filter((d) => d.specialty !== 'General');
  const primaryTemplate = faker.helpers.arrayElement(primaryPool);
  const secondaries = faker.helpers
    .arrayElements(
      DIAGNOSES.filter((d) => d.icd10 !== primaryTemplate.icd10),
      { min: 1, max: 3 },
    )
    .map<Diagnosis>((d: DiagnosisTemplate) => ({
      icd10: d.icd10,
      description: d.description,
      category: 'secondary',
      onsetDate: iso(-faker.number.int({ min: 30, max: 1500 }) * 24 * HOUR),
    }));
  return [
    {
      icd10: primaryTemplate.icd10,
      description: primaryTemplate.description,
      category: 'primary',
      onsetDate: iso(-faker.number.int({ min: 1, max: 20 }) * 24 * HOUR),
    },
    ...secondaries,
  ];
}

interface ClinicalContext {
  hasHF: boolean;
  hasRenal: boolean;
  hasInfection: boolean;
  hasSepsis: boolean;
  hasAnemia: boolean;
  hasMI: boolean;
  hasLiver: boolean;
  hasDM: boolean;
  hasHypoK: boolean;
}

function contextFromDiagnoses(dx: Diagnosis[]): ClinicalContext {
  const codes = dx.map((d) => d.icd10);
  const has = (...prefixes: string[]) => codes.some((c) => prefixes.some((p) => c.startsWith(p)));
  return {
    hasHF: has('I50'),
    hasRenal: has('N18', 'N17'),
    hasInfection: has('J18', 'N39', 'A41'),
    hasSepsis: has('A41'),
    hasAnemia: has('D64'),
    hasMI: has('I21'),
    hasLiver: has('K70'),
    hasDM: has('E11'),
    hasHypoK: has('E87.6'),
  };
}

/* -------------------------------- vitals -------------------------------- */

const VITAL_BASE: Record<Acuity, Omit<VitalSample, 'timestamp'>> = {
  stable: { hr: 74, sbp: 122, dbp: 76, rr: 16, temp: 36.6, spo2: 98, pain: 1 },
  guarded: { hr: 86, sbp: 132, dbp: 82, rr: 18, temp: 37.0, spo2: 96, pain: 3 },
  serious: { hr: 98, sbp: 140, dbp: 88, rr: 21, temp: 37.7, spo2: 93, pain: 4 },
  critical: { hr: 112, sbp: 98, dbp: 60, rr: 25, temp: 38.3, spo2: 90, pain: 5 },
};

function generateVitals(acuity: Acuity, ctx: ClinicalContext, count = 16): VitalSample[] {
  const base = VITAL_BASE[acuity];
  const samples: VitalSample[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const drift = (count - 1 - i) * 0.4;
    samples.push({
      timestamp: iso(-i * 2 * HOUR),
      hr: Math.round(base.hr + faker.number.int({ min: -8, max: 8 }) + (ctx.hasInfection ? 6 : 0)),
      sbp: Math.round(base.sbp + faker.number.int({ min: -12, max: 12 })),
      dbp: Math.round(base.dbp + faker.number.int({ min: -8, max: 8 })),
      rr: Math.round(base.rr + faker.number.int({ min: -2, max: 3 })),
      temp:
        Math.round(
          (base.temp + faker.number.float({ min: -0.3, max: 0.4 }) + (ctx.hasInfection ? 0.5 : 0)) * 10,
        ) / 10,
      spo2: Math.min(100, Math.round(base.spo2 + faker.number.int({ min: -2, max: 2 }) + drift * 0.1)),
      pain: Math.max(0, Math.min(10, Math.round(base.pain + faker.number.int({ min: -1, max: 2 })))),
    });
  }
  return samples;
}

/* --------------------------------- labs --------------------------------- */

function labValue(analyte: string, refLow: number, refHigh: number, precision: number, ctx: ClinicalContext): number {
  const span = refHigh - refLow || 1;
  const normal = () =>
    faker.number.float({ min: refLow + span * 0.15, max: refHigh - span * 0.15, fractionDigits: precision });
  const round = (v: number) => (precision === 0 ? Math.round(v) : Math.round(v * 10 ** precision) / 10 ** precision);

  switch (analyte) {
    case 'WBC':
      return ctx.hasInfection ? round(faker.number.float({ min: 12, max: 22, fractionDigits: 1 })) : round(normal());
    case 'Hemoglobin':
      return ctx.hasAnemia ? round(faker.number.float({ min: 7.2, max: 10, fractionDigits: 1 })) : round(normal());
    case 'Hematocrit':
      return ctx.hasAnemia ? round(faker.number.int({ min: 22, max: 31 })) : round(normal());
    case 'Creatinine':
      return ctx.hasRenal ? round(faker.number.float({ min: 1.6, max: 4.2, fractionDigits: 2 })) : round(normal());
    case 'BUN':
      return ctx.hasRenal ? round(faker.number.int({ min: 30, max: 78 })) : round(normal());
    case 'Potassium':
      if (ctx.hasRenal) return round(faker.number.float({ min: 5.2, max: 6.1, fractionDigits: 1 }));
      if (ctx.hasHypoK) return round(faker.number.float({ min: 2.8, max: 3.4, fractionDigits: 1 }));
      return round(normal());
    case 'Glucose':
      return ctx.hasDM ? round(faker.number.int({ min: 180, max: 360 })) : round(normal());
    case 'BNP':
      return ctx.hasHF ? round(faker.number.int({ min: 320, max: 1450 })) : round(normal());
    case 'Troponin I':
      return ctx.hasMI ? round(faker.number.float({ min: 0.5, max: 8, fractionDigits: 2 })) : round(normal());
    case 'CRP':
      return ctx.hasInfection ? round(faker.number.float({ min: 3, max: 18, fractionDigits: 1 })) : round(normal());
    case 'Lactate':
      return ctx.hasSepsis ? round(faker.number.float({ min: 2.6, max: 5.2, fractionDigits: 1 })) : round(normal());
    case 'AST':
      return ctx.hasLiver ? round(faker.number.int({ min: 60, max: 220 })) : round(normal());
    case 'ALT':
      return ctx.hasLiver ? round(faker.number.int({ min: 55, max: 180 })) : round(normal());
    case 'Total bilirubin':
      return ctx.hasLiver ? round(faker.number.float({ min: 1.5, max: 6, fractionDigits: 1 })) : round(normal());
    case 'Albumin':
      return ctx.hasLiver ? round(faker.number.float({ min: 2.2, max: 3.2, fractionDigits: 1 })) : round(normal());
    case 'INR':
      return ctx.hasLiver
        ? round(faker.number.float({ min: 1.4, max: 2.4, fractionDigits: 1 }))
        : round(normal());
    default:
      return round(normal());
  }
}

function generateLabs(ctx: ClinicalContext): LabResult[] {
  const panels = new Set(['CBC', 'BMP']);
  if (ctx.hasLiver) panels.add('LFT');
  if (ctx.hasMI || ctx.hasHF) panels.add('Cardiac');
  if (ctx.hasInfection) panels.add('Inflammatory');
  if (ctx.hasLiver || faker.datatype.boolean(0.3)) panels.add('Coag');

  const collectedAt = iso(-faker.number.int({ min: 2, max: 10 }) * HOUR);
  return LAB_CATALOG.filter((t) => panels.has(t.panel)).map<LabResult>((t) => {
    const value = labValue(t.analyte, t.refLow, t.refHigh, t.precision, ctx);
    return {
      id: uid('lab'),
      panel: t.panel,
      analyte: t.analyte,
      loinc: t.loinc,
      value,
      unit: t.unit,
      refLow: t.refLow,
      refHigh: t.refHigh,
      flag: computeLabFlag(value, t.refLow, t.refHigh),
      collectedAt,
    };
  });
}

/* ----------------------------- medications ------------------------------ */

function generateMedications(): Medication[] {
  const chosen = faker.helpers.arrayElements(MEDICATIONS, { min: 6, max: 10 });
  const seen = new Set<string>();
  const meds: Medication[] = [];
  for (const t of chosen) {
    const key = `${t.genericName}-${t.route}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const status = faker.helpers.weightedArrayElement([
      { weight: 8, value: 'active' as const },
      { weight: 1, value: 'held' as const },
      { weight: 1, value: 'discontinued' as const },
    ]);
    meds.push({
      id: uid('med'),
      genericName: t.genericName,
      brandName: t.brandName,
      dose: t.dose,
      route: t.route,
      frequency: t.frequency,
      indication: t.indication,
      status,
      highAlert: t.highAlert,
      startedAt: iso(-faker.number.int({ min: 1, max: 8 }) * 24 * HOUR),
      nextDueAt: status === 'active' ? iso(faker.number.int({ min: -1, max: 6 }) * HOUR) : undefined,
    });
  }
  return meds;
}

function generateMar(meds: Medication[], nurse: string): MarEntry[] {
  const entries: MarEntry[] = [];
  for (const med of meds.filter((m) => m.status === 'active')) {
    const label = `${med.genericName} ${med.dose} ${med.route}`;
    // A given dose earlier in the shift.
    entries.push({
      id: uid('mar'),
      medicationId: med.id,
      label,
      scheduledAt: iso(-faker.number.int({ min: 2, max: 6 }) * HOUR),
      status: 'given',
      administeredBy: nurse,
    });
    // An upcoming or due dose.
    const dueOffset = faker.number.int({ min: -1, max: 5 });
    entries.push({
      id: uid('mar'),
      medicationId: med.id,
      label,
      scheduledAt: iso(dueOffset * HOUR),
      status: dueOffset <= 0 ? 'due' : 'scheduled',
    });
  }
  return entries.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
}

/* -------------------------------- NANDA --------------------------------- */

function generateNanda(losDays: number): NandaDiagnosis[] {
  return faker.helpers.arrayElements(NANDA_LIBRARY, { min: 2, max: 4 }).map<NandaDiagnosis>((t) => ({
    id: uid('nanda'),
    code: t.code,
    label: t.label,
    domain: t.domain,
    definingCharacteristics: faker.helpers.arrayElements(t.definingCharacteristics, { min: 2, max: 3 }),
    relatedFactors: faker.helpers.arrayElements(t.relatedFactors, { min: 1, max: 2 }),
    noc: t.noc,
    nic: t.nic,
    priority: t.defaultPriority,
    status: faker.datatype.boolean(0.85) ? 'active' : 'resolved',
    identifiedAt: iso(-faker.number.int({ min: 1, max: Math.max(1, losDays) }) * 24 * HOUR),
  }));
}

/* -------------------------------- scales -------------------------------- */

function generateScales(acuity: Acuity, age: number, latestPain: number, isNeuro: boolean): AssessmentScales {
  const frail = acuity === 'serious' || acuity === 'critical' || age >= 75;
  const sub = () => faker.number.int({ min: frail ? 1 : 3, max: 4 });
  const braden = {
    sensoryPerception: sub(),
    moisture: sub(),
    activity: faker.number.int({ min: frail ? 1 : 2, max: 4 }),
    mobility: faker.number.int({ min: frail ? 1 : 2, max: 4 }),
    nutrition: sub(),
    frictionShear: faker.number.int({ min: 1, max: 3 }),
    total: 0,
    risk: 'none' as AssessmentScales['braden']['risk'],
  };
  braden.total =
    braden.sensoryPerception +
    braden.moisture +
    braden.activity +
    braden.mobility +
    braden.nutrition +
    braden.frictionShear;
  braden.risk = bradenRisk(braden.total);

  const morse = {
    history: faker.helpers.arrayElement([0, 25]),
    secondaryDiagnosis: faker.helpers.arrayElement([0, 15]),
    ambulatoryAid: faker.helpers.arrayElement([0, 15, 30]),
    ivTherapy: faker.helpers.arrayElement([0, 20]),
    gait: faker.helpers.arrayElement([0, 10, 20]),
    mentalStatus: faker.helpers.arrayElement([0, 15]),
    total: 0,
    risk: 'low' as AssessmentScales['morse']['risk'],
  };
  morse.total =
    morse.history +
    morse.secondaryDiagnosis +
    morse.ambulatoryAid +
    morse.ivTherapy +
    morse.gait +
    morse.mentalStatus;
  morse.risk = morseRisk(morse.total);

  const lowGcs = isNeuro || acuity === 'critical';
  const eye = lowGcs ? faker.number.int({ min: 3, max: 4 }) : 4;
  const verbal = lowGcs ? faker.number.int({ min: 3, max: 5 }) : 5;
  const motor = lowGcs ? faker.number.int({ min: 5, max: 6 }) : 6;

  return {
    braden,
    morse,
    gcs: { eye, verbal, motor, total: eye + verbal + motor },
    pain: latestPain,
  };
}

/* --------------------------- intake / output ---------------------------- */

function generateIntakeOutput(): IntakeOutput[] {
  return [0, 8, 16].map((offset) => ({
    timestamp: iso(-offset * HOUR),
    oralMl: faker.number.int({ min: 100, max: 500 }),
    ivMl: faker.number.int({ min: 0, max: 600 }),
    urineMl: faker.number.int({ min: 150, max: 600 }),
    otherOutputMl: faker.number.int({ min: 0, max: 150 }),
  }));
}

/* ------------------------------ care plan ------------------------------- */

const CARE_TASKS: Array<{ category: { en: string; ko: string }; description: string }> = [
  { category: { en: 'Vital Signs', ko: '활력징후' }, description: 'Reassess vital signs and document trend' },
  { category: { en: 'Medication', ko: '투약' }, description: 'Administer scheduled medications and verify response' },
  { category: { en: 'Mobility', ko: '기동' }, description: 'Assist with ambulation in hallway twice this shift' },
  { category: { en: 'Skin Care', ko: '피부 간호' }, description: 'Reposition q2h and inspect pressure points' },
  { category: { en: 'Hygiene', ko: '위생' }, description: 'Provide morning hygiene and oral care' },
  { category: { en: 'Education', ko: '교육' }, description: 'Reinforce discharge teaching with patient and family' },
  { category: { en: 'Nutrition', ko: '영양' }, description: 'Monitor intake and document meal percentage' },
  { category: { en: 'Lines & Drains', ko: '라인/배액관' }, description: 'Assess IV site and patency; document findings' },
];

function generateCarePlan(): CarePlanTask[] {
  return faker.helpers.arrayElements(CARE_TASKS, { min: 4, max: 6 }).map<CarePlanTask>((t) => ({
    id: uid('care'),
    category: t.category,
    description: t.description,
    due: iso(faker.number.int({ min: -2, max: 8 }) * HOUR),
    status: faker.helpers.weightedArrayElement([
      { weight: 4, value: 'pending' as const },
      { weight: 2, value: 'in-progress' as const },
      { weight: 4, value: 'completed' as const },
    ]),
    priority: faker.helpers.weightedArrayElement([
      { weight: 5, value: 'routine' as const },
      { weight: 3, value: 'important' as const },
      { weight: 1, value: 'urgent' as const },
    ]),
  }));
}

/* -------------------------------- patient ------------------------------- */

const ALLERGENS = ['Penicillin', 'Sulfa drugs', 'Aspirin', 'Latex', 'Iodine contrast', 'Codeine', 'Shellfish'];
const REACTIONS = ['Rash', 'Hives', 'Anaphylaxis', 'Nausea', 'Angioedema', 'Bronchospasm'];
const DIETS = ['Regular', 'Diabetic (ADA)', 'Cardiac (low sodium)', 'Renal', 'Soft / mechanical', 'Clear liquids', 'NPO'];
const MOBILITY = ['Independent', 'Assist ×1', 'Assist ×2', 'Bed rest', 'Wheelchair', 'Walker'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function generatePatient(index: number, ward: Ward): Patient {
  const sex: 'male' | 'female' = faker.helpers.arrayElement(['male', 'female']);
  const { name, nameKo, initials } = buildName(sex);
  const age = faker.number.int({ min: 34, max: 91 });
  const dob = iso(-age * 365 * 24 * HOUR - faker.number.int({ min: 0, max: 300 }) * 24 * HOUR);

  const acuity: Acuity =
    ward.code === '5W'
      ? faker.helpers.weightedArrayElement([
          { weight: 4, value: 'critical' },
          { weight: 4, value: 'serious' },
          { weight: 2, value: 'guarded' },
        ])
      : faker.helpers.weightedArrayElement([
          { weight: 5, value: 'stable' },
          { weight: 3, value: 'guarded' },
          { weight: 2, value: 'serious' },
          { weight: 1, value: 'critical' },
        ]);

  const diagnoses = pickDiagnoses(ward.specialty.en);
  const ctx = contextFromDiagnoses(diagnoses);
  const vitals = generateVitals(acuity, ctx);
  const latest = vitals[vitals.length - 1];

  const admittedAt = iso(-faker.number.int({ min: 1, max: 14 }) * 24 * HOUR);
  const losDays = Math.max(1, Math.round((Date.now() - +new Date(admittedAt)) / (24 * HOUR)));
  const heightCm = faker.number.int({ min: 150, max: 185 });
  const weightKg = faker.number.int({ min: 48, max: 96 });
  const primaryNurse = faker.helpers.arrayElement(NURSE_NAMES).en;
  const meds = generateMedications();

  const allergies = faker.datatype.boolean(0.55)
    ? faker.helpers.arrayElements(ALLERGENS, { min: 1, max: 2 }).map((allergen) => ({
        allergen,
        reaction: faker.helpers.arrayElement(REACTIONS),
        severity: faker.helpers.arrayElement(['mild', 'moderate', 'severe'] as const),
      }))
    : [];

  const isolation = faker.helpers.weightedArrayElement([
    { weight: 8, value: 'None' as const },
    { weight: 2, value: 'Contact' as const },
    { weight: 1, value: 'Droplet' as const },
  ]);
  const codeStatus = faker.helpers.weightedArrayElement([
    { weight: 8, value: 'Full Code' as const },
    { weight: 1, value: 'DNR' as const },
    { weight: 1, value: 'DNR / DNI' as const },
  ]);
  const diet = faker.helpers.arrayElement(DIETS);
  const scales = generateScales(acuity, age, latest.pain, ward.code === '9E');

  const flags: string[] = [];
  if (scales.morse.risk === 'high') flags.push('Fall Risk');
  if (diet === 'NPO') flags.push('NPO');
  if (isolation !== 'None') flags.push(`${isolation} Isolation`);
  if (codeStatus !== 'Full Code') flags.push(codeStatus);
  if (meds.some((m) => m.highAlert && m.status === 'active')) flags.push('High-Alert Meds');
  if (allergies.length > 0) flags.push('Allergy');
  if (scales.braden.risk === 'high' || scales.braden.risk === 'severe') flags.push('Pressure Injury Risk');

  return {
    id: `pt-${(index + 1).toString().padStart(3, '0')}`,
    mrn: `A${faker.string.numeric(7)}`,
    name,
    nameKo,
    initials,
    age,
    sex,
    dob,
    ward,
    room: `${ward.floor[0]}${faker.number.int({ min: 1, max: 24 }).toString().padStart(2, '0')}`,
    bed: faker.helpers.arrayElement(['A', 'B', '1', '2']),
    admittedAt,
    lengthOfStayDays: losDays,
    attending: faker.helpers.arrayElement(ATTENDINGS),
    primaryNurse,
    acuity,
    codeStatus,
    isolation,
    diet,
    mobility: faker.helpers.arrayElement(MOBILITY),
    heightCm,
    weightKg,
    bmi: computeBmi(heightCm, weightKg),
    bloodType: faker.helpers.arrayElement(BLOOD_TYPES),
    diagnoses,
    allergies,
    vitals,
    labs: generateLabs(ctx),
    medications: meds,
    mar: generateMar(meds, primaryNurse),
    nanda: generateNanda(losDays),
    scales,
    intakeOutput: generateIntakeOutput(),
    carePlan: generateCarePlan(),
    flags,
  };
}

/* ----------------------------- records etc. ----------------------------- */

function buildRoundingSession(patient: Patient, startedAtMsAgo: number): RoundingSession {
  const set = faker.helpers.arrayElement(QUESTION_SETS);
  const startedAt = iso(-startedAtMsAgo);
  const answers: RoundingAnswer[] = set.questionIds.map((qid, i) => {
    const question = ROUNDING_QUESTIONS.find((q) => q.id === qid)!;
    const replyIndex = faker.number.int({ min: 0, max: question.sampleReplies.length - 1 });
    return {
      questionId: qid,
      category: question.category,
      prompt: question.prompt,
      transcript: question.sampleReplies[replyIndex].ko,
      confidence: faker.number.float({ min: 0.9, max: 0.99, fractionDigits: 2 }),
      structured: STRUCTURED_REPLIES[qid]?.[replyIndex] ?? '',
      answeredAt: iso(-startedAtMsAgo + i * 12_000),
    };
  });
  return {
    id: uid('rs'),
    patientId: patient.id,
    startedAt,
    durationSec: 12 * answers.length + faker.number.int({ min: 4, max: 20 }),
    sttEngine: 'Google STT',
    locale: 'ko-KR',
    answers,
  };
}

function generateRecords(patient: Patient): NursingRecord[] {
  const records: NursingRecord[] = [];
  const count = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < count; i += 1) {
    const msAgo = (i + 1) * faker.number.int({ min: 6, max: 12 }) * HOUR;
    const createdAt = iso(-msAgo);
    const shift = shiftForHour(new Date(createdAt).getHours());
    if (faker.datatype.boolean(0.6)) {
      const session = buildRoundingSession(patient, msAgo);
      records.push({
        id: uid('rec'),
        patientId: patient.id,
        type: 'rounding',
        createdAt,
        author: patient.primaryNurse,
        shift,
        signed: true,
        session,
      });
    } else {
      const dx = patient.diagnoses[0]?.description ?? 'admitting diagnosis';
      records.push({
        id: uid('rec'),
        patientId: patient.id,
        type: 'SOAP',
        createdAt,
        author: patient.primaryNurse,
        shift,
        signed: faker.datatype.boolean(0.8),
        soap: {
          subjective: faker.helpers.arrayElement([
            'Patient reports feeling more comfortable since last assessment.',
            'Patient denies new complaints; requests assistance with ambulation.',
            'Patient reports intermittent discomfort relieved with repositioning.',
          ]),
          objective: `Vitals stable. Alert and oriented ×3. Managing ${dx.toLowerCase()}.`,
          assessment: `Progressing as expected for ${dx.toLowerCase()}. No acute distress noted.`,
          plan: 'Continue current plan of care, monitor vitals per protocol, reinforce teaching.',
        },
      });
    }
  }
  return records.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

function generateSchedule(patients: Patient[], nurse: string): ScheduledRound[] {
  const rounds: ScheduledRound[] = [];
  for (const patient of faker.helpers.arrayElements(patients, { min: 8, max: 14 })) {
    const offset = faker.number.int({ min: -4, max: 8 });
    rounds.push({
      id: uid('sched'),
      patientId: patient.id,
      scheduledAt: iso(offset * HOUR),
      questionSetId: faker.helpers.arrayElement(QUESTION_SETS).id,
      assignedNurse: nurse,
      status:
        offset < -1
          ? faker.helpers.arrayElement(['completed', 'missed'] as const)
          : offset <= 0
            ? 'in-progress'
            : 'scheduled',
    });
  }
  return rounds.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
}

/* ------------------------------- dataset -------------------------------- */

export interface Dataset {
  currentNurse: Nurse;
  patients: Patient[];
  records: NursingRecord[];
  schedule: ScheduledRound[];
}

const CURRENT_NURSE: Nurse = {
  id: 'nurse-001',
  name: 'Hur Jun',
  nameKo: '허준',
  role: { en: 'Registered Nurse', ko: '간호사' },
  unit: { en: 'Internal Medicine Unit · 7E', ko: '내과 병동 · 7E' },
  shift: 'Day',
  licenseNo: 'RN-2025-04417',
};

/** Builds the full synthetic dataset. Call `faker.seed` beforehand for stability. */
export function buildDataset(patientCount = 24): Dataset {
  const patients: Patient[] = [];
  for (let i = 0; i < patientCount; i += 1) {
    const ward = faker.helpers.weightedArrayElement([
      { weight: 4, value: WARDS[1] }, // 7E Internal Medicine
      { weight: 3, value: WARDS[2] }, // 8E Surgery
      { weight: 3, value: WARDS[3] }, // 6W Cardiology
      { weight: 2, value: WARDS[4] }, // 9E Neurology
      { weight: 2, value: WARDS[0] }, // 5W ICU
    ]);
    patients.push(generatePatient(i, ward));
  }
  const records = patients.flatMap(generateRecords);
  const schedule = generateSchedule(patients, CURRENT_NURSE.name);
  return { currentNurse: CURRENT_NURSE, patients, records, schedule };
}
