/**
 * Domain model for the MediVoice nursing information system.
 *
 * The shape mirrors the artefacts described in the underlying research: a
 * nursing record built from bedside voice rounds, NANDA-based nursing
 * diagnoses linked to NOC outcomes and NIC interventions, and the clinical
 * context (vitals, labs, medications, assessment scales) a nurse reviews
 * before documenting.
 */

export interface BilingualText {
  en: string;
  ko: string;
}

export type Sex = 'male' | 'female';
export type CodeStatus = 'Full Code' | 'DNR' | 'DNI' | 'DNR / DNI';
export type Acuity = 'stable' | 'guarded' | 'serious' | 'critical';
export type IsolationType = 'None' | 'Contact' | 'Droplet' | 'Airborne' | 'Protective';
export type Shift = 'Day' | 'Evening' | 'Night';
export type LabFlag = 'L' | 'N' | 'H' | 'LL' | 'HH';

export interface Ward {
  id: string;
  code: string;
  name: BilingualText;
  specialty: BilingualText;
  floor: string;
  beds: number;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface Diagnosis {
  icd10: string;
  description: string;
  category: 'primary' | 'secondary';
  onsetDate: string;
}

export interface VitalSample {
  timestamp: string;
  hr: number;
  sbp: number;
  dbp: number;
  rr: number;
  temp: number; // Celsius
  spo2: number;
  pain: number; // 0–10 numeric rating scale
}

export interface LabResult {
  id: string;
  panel: string;
  analyte: string;
  loinc?: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  flag: LabFlag;
  collectedAt: string;
}

export interface Medication {
  id: string;
  genericName: string;
  brandName?: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  status: 'active' | 'held' | 'discontinued';
  highAlert: boolean;
  startedAt: string;
  nextDueAt?: string;
}

export interface MarEntry {
  id: string;
  medicationId: string;
  label: string;
  scheduledAt: string;
  status: 'given' | 'due' | 'scheduled' | 'held' | 'missed';
  administeredBy?: string;
}

export interface NandaDiagnosis {
  id: string;
  code: string;
  label: BilingualText;
  domain: BilingualText;
  definingCharacteristics: string[];
  relatedFactors: string[];
  noc: { code: string; label: BilingualText };
  nic: Array<{ code: string; label: BilingualText }>;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved';
  identifiedAt: string;
}

export interface BradenScale {
  sensoryPerception: number;
  moisture: number;
  activity: number;
  mobility: number;
  nutrition: number;
  frictionShear: number;
  total: number;
  risk: 'severe' | 'high' | 'moderate' | 'mild' | 'none';
}

export interface MorseScale {
  history: number;
  secondaryDiagnosis: number;
  ambulatoryAid: number;
  ivTherapy: number;
  gait: number;
  mentalStatus: number;
  total: number;
  risk: 'high' | 'moderate' | 'low';
}

export interface GlasgowComaScale {
  eye: number;
  verbal: number;
  motor: number;
  total: number;
}

export interface AssessmentScales {
  braden: BradenScale;
  morse: MorseScale;
  gcs: GlasgowComaScale;
  pain: number;
}

export interface IntakeOutput {
  timestamp: string;
  oralMl: number;
  ivMl: number;
  urineMl: number;
  otherOutputMl: number;
}

export interface CarePlanTask {
  id: string;
  category: BilingualText;
  description: string;
  due: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'routine' | 'important' | 'urgent';
}

export type RoundingCategory =
  | 'medication'
  | 'elimination'
  | 'pain'
  | 'nutrition'
  | 'sleep'
  | 'mobility'
  | 'respiratory'
  | 'mood';

export interface RoundingQuestion {
  id: string;
  category: RoundingCategory;
  prompt: BilingualText;
  /** Sample patient replies used to drive the bedside simulation. */
  sampleReplies: BilingualText[];
}

export interface QuestionSet {
  id: string;
  name: BilingualText;
  description: BilingualText;
  questionIds: string[];
}

export interface RoundingAnswer {
  questionId: string;
  category: RoundingCategory;
  prompt: BilingualText;
  transcript: string;
  confidence: number;
  /** Normalized, chart-ready phrasing derived from the transcript. */
  structured: string;
  answeredAt: string;
}

export interface RoundingSession {
  id: string;
  patientId: string;
  startedAt: string;
  durationSec: number;
  sttEngine: string;
  locale: string;
  answers: RoundingAnswer[];
}

export interface NursingRecord {
  id: string;
  patientId: string;
  type: 'rounding' | 'SOAP' | 'narrative' | 'assessment';
  createdAt: string;
  author: string;
  shift: Shift;
  signed: boolean;
  soap?: { subjective: string; objective: string; assessment: string; plan: string };
  narrative?: string;
  session?: RoundingSession;
}

export interface ScheduledRound {
  id: string;
  patientId: string;
  scheduledAt: string;
  questionSetId: string;
  assignedNurse: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed';
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  nameKo: string;
  initials: string;
  age: number;
  sex: Sex;
  dob: string;
  ward: Ward;
  room: string;
  bed: string;
  admittedAt: string;
  lengthOfStayDays: number;
  attending: string;
  primaryNurse: string;
  acuity: Acuity;
  codeStatus: CodeStatus;
  isolation: IsolationType;
  diet: string;
  mobility: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bloodType: string;
  diagnoses: Diagnosis[];
  allergies: Allergy[];
  vitals: VitalSample[];
  labs: LabResult[];
  medications: Medication[];
  mar: MarEntry[];
  nanda: NandaDiagnosis[];
  scales: AssessmentScales;
  intakeOutput: IntakeOutput[];
  carePlan: CarePlanTask[];
  flags: string[];
}

export interface Nurse {
  id: string;
  name: string;
  nameKo: string;
  role: BilingualText;
  unit: BilingualText;
  shift: Shift;
  licenseNo: string;
}

/* ------------------------------------------------------------------ *
 * Research artefacts — reproduced from the underlying thesis so the
 * Research screen can present the real benchmark and efficiency data.
 * ------------------------------------------------------------------ */

export interface SttEngineBenchmark {
  engine: string;
  recognized: string;
  characterErrors: number;
  cer: number;
  latencyMs: number;
  recommended: boolean;
}

export interface EfficiencyStep {
  step: BilingualText;
  traditionalSec: number;
  assistedSec: number;
  oncePerRound: boolean;
}

export interface RecognitionByAge {
  ageGroup: string;
  utterances: number;
  passRate: number;
  meanCer: number;
}
