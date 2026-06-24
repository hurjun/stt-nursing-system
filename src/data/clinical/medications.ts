/** Hospital formulary used to build realistic medication and MAR records. */
export interface MedicationTemplate {
  genericName: string;
  brandName: string;
  dose: string;
  route: 'PO' | 'IV' | 'IM' | 'SC' | 'NEB' | 'PR' | 'SL';
  frequency: string;
  indication: string;
  highAlert: boolean;
}

export const MEDICATIONS: MedicationTemplate[] = [
  { genericName: 'Furosemide', brandName: 'Lasix', dose: '40 mg', route: 'IV', frequency: 'BID', indication: 'Volume overload', highAlert: false },
  { genericName: 'Metoprolol tartrate', brandName: 'Lopressor', dose: '25 mg', route: 'PO', frequency: 'BID', indication: 'Rate control', highAlert: false },
  { genericName: 'Lisinopril', brandName: 'Zestril', dose: '10 mg', route: 'PO', frequency: 'Daily', indication: 'Hypertension', highAlert: false },
  { genericName: 'Amlodipine', brandName: 'Norvasc', dose: '5 mg', route: 'PO', frequency: 'Daily', indication: 'Hypertension', highAlert: false },
  { genericName: 'Atorvastatin', brandName: 'Lipitor', dose: '40 mg', route: 'PO', frequency: 'QHS', indication: 'Hyperlipidemia', highAlert: false },
  { genericName: 'Aspirin', brandName: 'Ecotrin', dose: '81 mg', route: 'PO', frequency: 'Daily', indication: 'Antiplatelet', highAlert: false },
  { genericName: 'Insulin glargine', brandName: 'Lantus', dose: '20 units', route: 'SC', frequency: 'QHS', indication: 'Diabetes mellitus', highAlert: true },
  { genericName: 'Insulin aspart', brandName: 'NovoLog', dose: 'Sliding scale', route: 'SC', frequency: 'AC + HS', indication: 'Glycemic control', highAlert: true },
  { genericName: 'Metformin', brandName: 'Glucophage', dose: '500 mg', route: 'PO', frequency: 'BID', indication: 'Type 2 diabetes', highAlert: false },
  { genericName: 'Enoxaparin', brandName: 'Lovenox', dose: '40 mg', route: 'SC', frequency: 'Daily', indication: 'VTE prophylaxis', highAlert: true },
  { genericName: 'Heparin', brandName: 'Hep-Lock', dose: '5,000 units', route: 'SC', frequency: 'Q8H', indication: 'VTE prophylaxis', highAlert: true },
  { genericName: 'Warfarin', brandName: 'Coumadin', dose: '5 mg', route: 'PO', frequency: 'Daily', indication: 'Anticoagulation', highAlert: true },
  { genericName: 'Pantoprazole', brandName: 'Protonix', dose: '40 mg', route: 'IV', frequency: 'Daily', indication: 'Stress ulcer prophylaxis', highAlert: false },
  { genericName: 'Ceftriaxone', brandName: 'Rocephin', dose: '1 g', route: 'IV', frequency: 'Daily', indication: 'Bacterial infection', highAlert: false },
  { genericName: 'Piperacillin-tazobactam', brandName: 'Zosyn', dose: '3.375 g', route: 'IV', frequency: 'Q6H', indication: 'Broad-spectrum infection', highAlert: false },
  { genericName: 'Acetaminophen', brandName: 'Tylenol', dose: '650 mg', route: 'PO', frequency: 'Q6H PRN', indication: 'Pain / fever', highAlert: false },
  { genericName: 'Morphine sulfate', brandName: 'MS Contin', dose: '2 mg', route: 'IV', frequency: 'Q4H PRN', indication: 'Moderate–severe pain', highAlert: true },
  { genericName: 'Ondansetron', brandName: 'Zofran', dose: '4 mg', route: 'IV', frequency: 'Q8H PRN', indication: 'Nausea / vomiting', highAlert: false },
  { genericName: 'Potassium chloride', brandName: 'K-Dur', dose: '20 mEq', route: 'PO', frequency: 'Daily', indication: 'Hypokalemia', highAlert: true },
  { genericName: 'Albuterol', brandName: 'Ventolin', dose: '2.5 mg', route: 'NEB', frequency: 'Q6H PRN', indication: 'Bronchospasm', highAlert: false },
  { genericName: 'Levothyroxine', brandName: 'Synthroid', dose: '50 mcg', route: 'PO', frequency: 'Daily AM', indication: 'Hypothyroidism', highAlert: false },
  { genericName: 'Pantoprazole', brandName: 'Protonix', dose: '40 mg', route: 'PO', frequency: 'Daily', indication: 'GERD', highAlert: false },
];
