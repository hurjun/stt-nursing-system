import type { EfficiencyStep, RecognitionByAge, SttEngineBenchmark } from '@/types/clinical';

/**
 * Research artefacts reproduced from the underlying thesis:
 * "A study on work efficiency improvement using an AI-speaker-based nursing
 * record work assistance system" (Hur J., Choi H., Kim Y.).
 */

/** Korean STT engine comparison on a fixed reference utterance (page 19). */
export const STT_REFERENCE_UTTERANCE =
  '안녕하세요 여름입니다. 저는 충남대학교 컴퓨터공학 학생입니다';

export const STT_BENCHMARKS: SttEngineBenchmark[] = [
  { engine: 'Google STT', recognized: '안녕하세요 여름입니다. 저는 충남대학교 컴퓨터공학 학생입니다', characterErrors: 0, cer: 0.0, latencyMs: 410, recommended: true },
  { engine: 'Microsoft Azure', recognized: '안녕하세요 여름입니다. 저는 충남대학교 컴퓨터공학 학셍입니다', characterErrors: 1, cer: 3.7, latencyMs: 520, recommended: false },
  { engine: 'Naver Papago', recognized: '안녕하세요 여름입니다. 저는 충남대학교 컴퓨터공학 학셍입니다', characterErrors: 1, cer: 3.7, latencyMs: 480, recommended: false },
  { engine: 'ETRI', recognized: '안녕하세요 여름입니다. 저는 중남대학교 컴퓨터공학 학성입니다', characterErrors: 4, cer: 14.8, latencyMs: 610, recommended: false },
];

/**
 * Time-and-motion comparison of a single repeated bedside assessment
 * (traditional charting vs. the AI-speaker-assisted workflow). Walking
 * distances assume a 45.5 m corridor at 1.41 m/s, as measured in the thesis.
 */
export const EFFICIENCY_STEPS: EfficiencyStep[] = [
  { step: { en: 'Retrieve patient data', ko: '환자 데이터 조회' }, traditionalSec: 19, assistedSec: 15, oncePerRound: true },
  { step: { en: 'Compose assessment question', ko: '질문 작성' }, traditionalSec: 14, assistedSec: 14, oncePerRound: true },
  { step: { en: 'Walk to bedside', ko: '병실로 이동' }, traditionalSec: 32, assistedSec: 0, oncePerRound: false },
  { step: { en: 'Pose the question to patient', ko: '환자에게 질문' }, traditionalSec: 5, assistedSec: 1, oncePerRound: false },
  { step: { en: 'Capture patient response', ko: '환자 응답 기록' }, traditionalSec: 4, assistedSec: 3, oncePerRound: false },
  { step: { en: 'Write nursing record', ko: '간호기록 작성' }, traditionalSec: 13, assistedSec: 0, oncePerRound: false },
  { step: { en: 'Walk back to station', ko: '스테이션 복귀' }, traditionalSec: 32, assistedSec: 0, oncePerRound: false },
  { step: { en: 'Enter into nursing system', ko: '간호정보시스템 입력' }, traditionalSec: 4, assistedSec: 0, oncePerRound: false },
];

/** Recognition quality by patient age group (20s / 50s / 80s cohorts). */
export const RECOGNITION_BY_AGE: RecognitionByAge[] = [
  { ageGroup: '20s', utterances: 20, passRate: 100, meanCer: 0.0 },
  { ageGroup: '50s', utterances: 20, passRate: 95, meanCer: 1.2 },
  { ageGroup: '80s', utterances: 20, passRate: 90, meanCer: 2.8 },
];

/** Headline figures reported in the study. */
export const RESEARCH_HEADLINES = {
  firstUseReductionPct: 70,
  repeatUseReductionPct: 96,
  bestEngine: 'Google STT',
  bestEngineCer: 0.0,
  cerPassThreshold: 20,
  studyAuthors: 'Hur J., Choi H., Kim Y.',
  nandaDiagnoses: 57,
  assessmentItems: 127,
  interventions: 272,
} as const;
