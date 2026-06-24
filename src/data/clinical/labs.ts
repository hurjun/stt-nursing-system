/** Laboratory catalog with reference ranges, used to generate flagged results. */
export interface LabTemplate {
  panel: string;
  analyte: string;
  unit: string;
  refLow: number;
  refHigh: number;
  loinc?: string;
  /** Typical decimal precision for display. */
  precision: number;
}

export const LAB_CATALOG: LabTemplate[] = [
  // Complete Blood Count
  { panel: 'CBC', analyte: 'WBC', unit: '10³/µL', refLow: 4.0, refHigh: 10.0, loinc: '6690-2', precision: 1 },
  { panel: 'CBC', analyte: 'Hemoglobin', unit: 'g/dL', refLow: 12.0, refHigh: 16.0, loinc: '718-7', precision: 1 },
  { panel: 'CBC', analyte: 'Hematocrit', unit: '%', refLow: 36, refHigh: 46, loinc: '4544-3', precision: 0 },
  { panel: 'CBC', analyte: 'Platelets', unit: '10³/µL', refLow: 150, refHigh: 400, loinc: '777-3', precision: 0 },

  // Basic Metabolic Panel
  { panel: 'BMP', analyte: 'Sodium', unit: 'mmol/L', refLow: 135, refHigh: 145, loinc: '2951-2', precision: 0 },
  { panel: 'BMP', analyte: 'Potassium', unit: 'mmol/L', refLow: 3.5, refHigh: 5.1, loinc: '2823-3', precision: 1 },
  { panel: 'BMP', analyte: 'Chloride', unit: 'mmol/L', refLow: 98, refHigh: 107, loinc: '2075-0', precision: 0 },
  { panel: 'BMP', analyte: 'CO₂', unit: 'mmol/L', refLow: 22, refHigh: 29, loinc: '2028-9', precision: 0 },
  { panel: 'BMP', analyte: 'BUN', unit: 'mg/dL', refLow: 7, refHigh: 20, loinc: '3094-0', precision: 0 },
  { panel: 'BMP', analyte: 'Creatinine', unit: 'mg/dL', refLow: 0.6, refHigh: 1.3, loinc: '2160-0', precision: 2 },
  { panel: 'BMP', analyte: 'Glucose', unit: 'mg/dL', refLow: 70, refHigh: 110, loinc: '2345-7', precision: 0 },
  { panel: 'BMP', analyte: 'Calcium', unit: 'mg/dL', refLow: 8.5, refHigh: 10.5, loinc: '17861-6', precision: 1 },

  // Liver Function
  { panel: 'LFT', analyte: 'AST', unit: 'U/L', refLow: 10, refHigh: 40, loinc: '1920-8', precision: 0 },
  { panel: 'LFT', analyte: 'ALT', unit: 'U/L', refLow: 7, refHigh: 56, loinc: '1742-6', precision: 0 },
  { panel: 'LFT', analyte: 'Total bilirubin', unit: 'mg/dL', refLow: 0.1, refHigh: 1.2, loinc: '1975-2', precision: 1 },
  { panel: 'LFT', analyte: 'Albumin', unit: 'g/dL', refLow: 3.5, refHigh: 5.0, loinc: '1751-7', precision: 1 },

  // Coagulation
  { panel: 'Coag', analyte: 'INR', unit: '', refLow: 0.8, refHigh: 1.1, loinc: '6301-6', precision: 1 },
  { panel: 'Coag', analyte: 'aPTT', unit: 'sec', refLow: 25, refHigh: 35, loinc: '14979-9', precision: 0 },

  // Cardiac / inflammatory
  { panel: 'Cardiac', analyte: 'Troponin I', unit: 'ng/mL', refLow: 0, refHigh: 0.04, loinc: '10839-9', precision: 2 },
  { panel: 'Cardiac', analyte: 'BNP', unit: 'pg/mL', refLow: 0, refHigh: 100, loinc: '30934-4', precision: 0 },
  { panel: 'Inflammatory', analyte: 'CRP', unit: 'mg/dL', refLow: 0, refHigh: 0.5, loinc: '1988-5', precision: 1 },
  { panel: 'Inflammatory', analyte: 'Lactate', unit: 'mmol/L', refLow: 0.5, refHigh: 2.2, loinc: '2524-7', precision: 1 },
];
