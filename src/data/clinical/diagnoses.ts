/** Curated ICD-10 problem list grouped by the specialty that typically owns it. */
export interface DiagnosisTemplate {
  icd10: string;
  description: string;
  specialty: 'Cardiology' | 'Internal Medicine' | 'Surgery' | 'Neurology' | 'Critical Care' | 'General';
}

export const DIAGNOSES: DiagnosisTemplate[] = [
  { icd10: 'I50.9', description: 'Congestive heart failure, unspecified', specialty: 'Cardiology' },
  { icd10: 'I21.4', description: 'Non-ST elevation myocardial infarction (NSTEMI)', specialty: 'Cardiology' },
  { icd10: 'I48.91', description: 'Atrial fibrillation, unspecified', specialty: 'Cardiology' },
  { icd10: 'I10', description: 'Essential (primary) hypertension', specialty: 'Cardiology' },
  { icd10: 'J18.9', description: 'Pneumonia, unspecified organism', specialty: 'Internal Medicine' },
  { icd10: 'J44.1', description: 'COPD with acute exacerbation', specialty: 'Internal Medicine' },
  { icd10: 'J96.00', description: 'Acute respiratory failure, unspecified', specialty: 'Critical Care' },
  { icd10: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', specialty: 'Internal Medicine' },
  { icd10: 'N18.3', description: 'Chronic kidney disease, stage 3 (moderate)', specialty: 'Internal Medicine' },
  { icd10: 'N17.9', description: 'Acute kidney injury, unspecified', specialty: 'Critical Care' },
  { icd10: 'A41.9', description: 'Sepsis, unspecified organism', specialty: 'Critical Care' },
  { icd10: 'N39.0', description: 'Urinary tract infection, site not specified', specialty: 'Internal Medicine' },
  { icd10: 'K92.2', description: 'Gastrointestinal hemorrhage, unspecified', specialty: 'Surgery' },
  { icd10: 'K70.30', description: 'Alcoholic cirrhosis of liver without ascites', specialty: 'Internal Medicine' },
  { icd10: 'K35.80', description: 'Acute appendicitis, unspecified', specialty: 'Surgery' },
  { icd10: 'S72.001A', description: 'Fracture of neck of right femur, initial encounter', specialty: 'Surgery' },
  { icd10: 'I63.9', description: 'Cerebral infarction, unspecified', specialty: 'Neurology' },
  { icd10: 'G40.909', description: 'Epilepsy, unspecified, without status epilepticus', specialty: 'Neurology' },
  { icd10: 'F03.90', description: 'Unspecified dementia without behavioral disturbance', specialty: 'Neurology' },
  { icd10: 'E86.0', description: 'Dehydration', specialty: 'General' },
  { icd10: 'E87.6', description: 'Hypokalemia', specialty: 'General' },
  { icd10: 'D64.9', description: 'Anemia, unspecified', specialty: 'General' },
  { icd10: 'L89.153', description: 'Pressure ulcer of sacral region, stage 3', specialty: 'General' },
  { icd10: 'C34.90', description: 'Malignant neoplasm of unspecified part of bronchus or lung', specialty: 'Internal Medicine' },
];
