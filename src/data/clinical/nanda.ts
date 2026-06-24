import type { BilingualText } from '@/types/clinical';

/**
 * NANDA-I nursing diagnosis library linked to NOC outcomes and NIC
 * interventions. The thesis selected 127 assessment items and 272 interventions
 * for internal / external medicine units; this is a representative core set.
 */
export interface NandaTemplate {
  code: string;
  label: BilingualText;
  domain: BilingualText;
  definingCharacteristics: string[];
  relatedFactors: string[];
  noc: { code: string; label: BilingualText };
  nic: Array<{ code: string; label: BilingualText }>;
  defaultPriority: 'high' | 'medium' | 'low';
}

export const NANDA_LIBRARY: NandaTemplate[] = [
  {
    code: '00132',
    label: { en: 'Acute Pain', ko: '급성 통증' },
    domain: { en: 'Comfort', ko: '안위' },
    definingCharacteristics: ['Self-report of pain intensity', 'Guarding behavior', 'Elevated heart rate'],
    relatedFactors: ['Surgical incision', 'Tissue injury', 'Inflammatory process'],
    noc: { code: '2102', label: { en: 'Pain Level', ko: '통증 수준' } },
    nic: [
      { code: '1400', label: { en: 'Pain Management', ko: '통증 관리' } },
      { code: '2210', label: { en: 'Analgesic Administration', ko: '진통제 투여' } },
    ],
    defaultPriority: 'high',
  },
  {
    code: '00085',
    label: { en: 'Impaired Physical Mobility', ko: '신체 기동성 장애' },
    domain: { en: 'Activity / Rest', ko: '활동/휴식' },
    definingCharacteristics: ['Limited range of motion', 'Difficulty turning', 'Slowed movement'],
    relatedFactors: ['Pain', 'Musculoskeletal impairment', 'Prolonged bed rest'],
    noc: { code: '0208', label: { en: 'Mobility', ko: '기동성' } },
    nic: [
      { code: '0224', label: { en: 'Exercise Therapy: Joint Mobility', ko: '관절 가동 운동 요법' } },
      { code: '6486', label: { en: 'Environmental Management: Safety', ko: '환경 관리: 안전' } },
    ],
    defaultPriority: 'medium',
  },
  {
    code: '00155',
    label: { en: 'Risk for Falls', ko: '낙상 위험성' },
    domain: { en: 'Safety / Protection', ko: '안전/보호' },
    definingCharacteristics: ['History of falls', 'Use of assistive device', 'Impaired gait'],
    relatedFactors: ['Advanced age', 'Sedating medication', 'Orthostatic hypotension'],
    noc: { code: '1909', label: { en: 'Fall Prevention Behavior', ko: '낙상 예방 행위' } },
    nic: [
      { code: '6490', label: { en: 'Fall Prevention', ko: '낙상 예방' } },
      { code: '6654', label: { en: 'Surveillance: Safety', ko: '감시: 안전' } },
    ],
    defaultPriority: 'high',
  },
  {
    code: '00047',
    label: { en: 'Risk for Impaired Skin Integrity', ko: '피부 통합성 장애 위험성' },
    domain: { en: 'Safety / Protection', ko: '안전/보호' },
    definingCharacteristics: ['Reddened pressure points', 'Limited mobility', 'Moisture exposure'],
    relatedFactors: ['Immobility', 'Inadequate nutrition', 'Incontinence'],
    noc: { code: '1101', label: { en: 'Tissue Integrity: Skin & Mucous Membranes', ko: '조직 통합성: 피부 및 점막' } },
    nic: [
      { code: '3540', label: { en: 'Pressure Ulcer Prevention', ko: '욕창 예방' } },
      { code: '0840', label: { en: 'Positioning', ko: '체위 변경' } },
    ],
    defaultPriority: 'medium',
  },
  {
    code: '00002',
    label: { en: 'Imbalanced Nutrition: Less than Body Requirements', ko: '영양불균형: 신체요구량보다 적음' },
    domain: { en: 'Nutrition', ko: '영양' },
    definingCharacteristics: ['Insufficient intake', 'Weight loss', 'Reported poor appetite'],
    relatedFactors: ['Nausea', 'Decreased appetite', 'Difficulty swallowing'],
    noc: { code: '1004', label: { en: 'Nutritional Status', ko: '영양 상태' } },
    nic: [
      { code: '1100', label: { en: 'Nutrition Management', ko: '영양 관리' } },
      { code: '1160', label: { en: 'Nutritional Monitoring', ko: '영양 모니터링' } },
    ],
    defaultPriority: 'medium',
  },
  {
    code: '00032',
    label: { en: 'Ineffective Breathing Pattern', ko: '비효율적 호흡 양상' },
    domain: { en: 'Activity / Rest', ko: '활동/휴식' },
    definingCharacteristics: ['Dyspnea', 'Use of accessory muscles', 'Altered respiratory rate'],
    relatedFactors: ['Anxiety', 'Pulmonary congestion', 'Fatigue'],
    noc: { code: '0415', label: { en: 'Respiratory Status', ko: '호흡 상태' } },
    nic: [
      { code: '3350', label: { en: 'Respiratory Monitoring', ko: '호흡 모니터링' } },
      { code: '3320', label: { en: 'Oxygen Therapy', ko: '산소 요법' } },
    ],
    defaultPriority: 'high',
  },
  {
    code: '00004',
    label: { en: 'Risk for Infection', ko: '감염 위험성' },
    domain: { en: 'Safety / Protection', ko: '안전/보호' },
    definingCharacteristics: ['Invasive lines present', 'Elevated WBC', 'Break in skin integrity'],
    relatedFactors: ['Invasive procedure', 'Immunosuppression', 'Chronic disease'],
    noc: { code: '0703', label: { en: 'Infection Severity', ko: '감염 중증도' } },
    nic: [
      { code: '6540', label: { en: 'Infection Control', ko: '감염 관리' } },
      { code: '6550', label: { en: 'Infection Protection', ko: '감염 예방' } },
    ],
    defaultPriority: 'high',
  },
  {
    code: '00092',
    label: { en: 'Activity Intolerance', ko: '활동 지속성 장애' },
    domain: { en: 'Activity / Rest', ko: '활동/휴식' },
    definingCharacteristics: ['Exertional dyspnea', 'Fatigue', 'Abnormal heart rate response'],
    relatedFactors: ['Generalized weakness', 'Imbalance between oxygen supply and demand'],
    noc: { code: '0005', label: { en: 'Activity Tolerance', ko: '활동 내성' } },
    nic: [
      { code: '0180', label: { en: 'Energy Management', ko: '에너지 관리' } },
      { code: '0200', label: { en: 'Exercise Promotion', ko: '운동 증진' } },
    ],
    defaultPriority: 'medium',
  },
  {
    code: '00198',
    label: { en: 'Disturbed Sleep Pattern', ko: '수면 양상 장애' },
    domain: { en: 'Activity / Rest', ko: '활동/휴식' },
    definingCharacteristics: ['Reported difficulty falling asleep', 'Frequent awakening', 'Daytime drowsiness'],
    relatedFactors: ['Unfamiliar environment', 'Pain', 'Frequent nursing interventions'],
    noc: { code: '0004', label: { en: 'Sleep', ko: '수면' } },
    nic: [
      { code: '1850', label: { en: 'Sleep Enhancement', ko: '수면 증진' } },
      { code: '6482', label: { en: 'Environmental Management: Comfort', ko: '환경 관리: 안위' } },
    ],
    defaultPriority: 'low',
  },
  {
    code: '00011',
    label: { en: 'Constipation', ko: '변비' },
    domain: { en: 'Elimination & Exchange', ko: '배설과 교환' },
    definingCharacteristics: ['Decreased stool frequency', 'Abdominal distension', 'Straining'],
    relatedFactors: ['Reduced mobility', 'Opioid use', 'Inadequate fluid intake'],
    noc: { code: '0501', label: { en: 'Bowel Elimination', ko: '장 배설' } },
    nic: [
      { code: '0450', label: { en: 'Constipation / Impaction Management', ko: '변비 관리' } },
      { code: '0430', label: { en: 'Bowel Management', ko: '배변 관리' } },
    ],
    defaultPriority: 'low',
  },
  {
    code: '00146',
    label: { en: 'Anxiety', ko: '불안' },
    domain: { en: 'Coping / Stress Tolerance', ko: '대처/스트레스 내성' },
    definingCharacteristics: ['Expressed concern', 'Restlessness', 'Increased tension'],
    relatedFactors: ['Change in health status', 'Unfamiliar environment', 'Uncertainty'],
    noc: { code: '1211', label: { en: 'Anxiety Level', ko: '불안 수준' } },
    nic: [
      { code: '5820', label: { en: 'Anxiety Reduction', ko: '불안 감소' } },
      { code: '5230', label: { en: 'Coping Enhancement', ko: '대처 증진' } },
    ],
    defaultPriority: 'low',
  },
  {
    code: '00026',
    label: { en: 'Excess Fluid Volume', ko: '체액 과다' },
    domain: { en: 'Nutrition', ko: '영양' },
    definingCharacteristics: ['Peripheral edema', 'Weight gain', 'Adventitious breath sounds'],
    relatedFactors: ['Compromised regulatory mechanism', 'Excess sodium intake'],
    noc: { code: '0601', label: { en: 'Fluid Balance', ko: '수분 균형' } },
    nic: [
      { code: '4120', label: { en: 'Fluid Management', ko: '수분 관리' } },
      { code: '2080', label: { en: 'Fluid / Electrolyte Management', ko: '수분/전해질 관리' } },
    ],
    defaultPriority: 'medium',
  },
];
