import { jsPDF } from 'jspdf';
import autoTableImport from 'jspdf-autotable';
import type { NursingRecord, Patient, RoundingSession } from '@/types/clinical';

// `jspdf-autotable`'s default export is unwrapped differently by browser bundlers
// vs. Node's ESM/CJS interop, so normalize it to the callable function.
const autoTable = ((autoTableImport as unknown as { default?: typeof autoTableImport }).default ??
  autoTableImport) as typeof autoTableImport;
import { meanArterialPressure } from './clinical';

const BRAND: [number, number, number] = [11, 107, 203];
const INK: [number, number, number] = [21, 35, 59];
const MUTED: [number, number, number] = [90, 107, 133];

function stamp(): string {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function addHeader(doc: jsPDF, title: string, subtitle: string): number {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, w, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('MediVoice', 14, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('AI-Speaker Nursing Information System', 14, 18.5);

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(subtitle, 14, 47);
  doc.text(`Generated ${stamp()}`, w - 14, 40, { align: 'right' });
  return 54;
}

function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(220, 226, 234);
    doc.line(14, h - 14, w - 14, h - 14);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Confidential · Synthetic data for demonstration only', 14, h - 9);
    doc.text(`Page ${i} of ${pageCount}`, w - 14, h - 9, { align: 'right' });
  }
}

function demographicsRows(patient: Patient): string[][] {
  // English-only fields: jsPDF core fonts do not embed Korean glyphs.
  return [
    ['Patient', patient.name],
    ['MRN', patient.mrn],
    ['Age / Sex', `${patient.age} · ${patient.sex === 'male' ? 'M' : 'F'}`],
    ['Location', `${patient.ward.code} · Room ${patient.room}-${patient.bed}`],
    ['Attending', patient.attending],
    ['Code status', patient.codeStatus],
    ['Allergies', patient.allergies.length ? patient.allergies.map((a) => a.allergen).join(', ') : 'NKDA'],
    ['Diet', patient.diet],
  ];
}

function afterTableY(doc: jsPDF, fallback: number): number {
  const last = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  return last ? last.finalY + 8 : fallback;
}

/** Builds a complete nursing assessment / EMR summary for a patient. */
export function buildPatientReport(patient: Patient): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Nursing Assessment Report', `${patient.ward.name.en} · ${patient.ward.code}`);

  autoTable(doc, {
    startY: y,
    head: [['Demographics', '']],
    body: demographicsRows(patient),
    theme: 'grid',
    headStyles: { fillColor: BRAND, halign: 'left' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, textColor: MUTED } },
    styles: { fontSize: 9, cellPadding: 2.2 },
  });

  const v = patient.vitals[patient.vitals.length - 1];
  y = afterTableY(doc, y);
  autoTable(doc, {
    startY: y,
    head: [['HR', 'BP', 'MAP', 'RR', 'Temp', 'SpO₂', 'Pain']],
    body: [
      [
        `${v.hr} bpm`,
        `${v.sbp}/${v.dbp}`,
        `${meanArterialPressure(v)}`,
        `${v.rr}/min`,
        `${v.temp.toFixed(1)} °C`,
        `${v.spo2}%`,
        `${v.pain}/10`,
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: INK },
    styles: { fontSize: 9, halign: 'center', cellPadding: 2.2 },
  });

  y = afterTableY(doc, y);
  autoTable(doc, {
    startY: y,
    head: [['Active Problems (ICD-10)', 'Type']],
    body: patient.diagnoses.map((d) => [`${d.icd10} · ${d.description}`, d.category]),
    theme: 'grid',
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 9, cellPadding: 2.2 },
  });

  y = afterTableY(doc, y);
  autoTable(doc, {
    startY: y,
    head: [['Nursing Diagnosis (NANDA)', 'NOC Outcome', 'Priority']],
    body: patient.nanda.map((n) => [`${n.code} · ${n.label.en}`, n.noc.label.en, n.priority]),
    theme: 'grid',
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 9, cellPadding: 2.2 },
  });

  y = afterTableY(doc, y);
  autoTable(doc, {
    startY: y,
    head: [['Active Medications', 'Dose', 'Route', 'Frequency']],
    body: patient.medications
      .filter((m) => m.status === 'active')
      .map((m) => [`${m.genericName}${m.highAlert ? '  ⚠' : ''}`, m.dose, m.route, m.frequency]),
    theme: 'striped',
    headStyles: { fillColor: INK },
    styles: { fontSize: 9, cellPadding: 2.2 },
  });

  addSignature(doc, patient.primaryNurse);
  addFooter(doc);
  return doc;
}

/** Builds a focused report for a single AI-speaker rounding session. */
export function buildRoundingReport(
  patient: Patient,
  session: RoundingSession,
  nurseName: string,
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'Voice Rounding Record', `${patient.name} · ${patient.ward.code} Room ${patient.room}`);

  autoTable(doc, {
    startY: y,
    head: [['Session', '']],
    body: [
      ['Recorded by', nurseName],
      ['STT engine', session.sttEngine],
      ['Locale', session.locale],
      ['Duration', `${session.durationSec}s`],
      ['Questions', String(session.answers.length)],
    ],
    theme: 'grid',
    headStyles: { fillColor: BRAND },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, textColor: MUTED } },
    styles: { fontSize: 9, cellPadding: 2.2 },
  });

  y = afterTableY(doc, y);
  autoTable(doc, {
    startY: y,
    head: [['Prompt', 'Transcript', 'Charted as', 'Conf.']],
    body: session.answers.map((a) => [
      a.prompt.en,
      a.transcript,
      a.structured,
      `${Math.round(a.confidence * 100)}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: BRAND },
    columnStyles: { 3: { halign: 'center', cellWidth: 16 } },
    styles: { fontSize: 8.5, cellPadding: 2.2, valign: 'top' },
  });

  addSignature(doc, nurseName);
  addFooter(doc);
  return doc;
}

function addSignature(doc: jsPDF, name: string): void {
  const y = afterTableY(doc, 70);
  const h = doc.internal.pageSize.getHeight();
  const top = Math.min(y + 6, h - 30);
  doc.setDrawColor(150, 160, 175);
  doc.line(14, top + 8, 80, top + 8);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Signed electronically · ${name}`, 14, top + 13);
  doc.text(stamp(), 14, top + 17.5);
}

export function downloadPatientReport(patient: Patient): void {
  buildPatientReport(patient).save(`MediVoice_${patient.mrn}_assessment.pdf`);
}

export function downloadRoundingReport(
  patient: Patient,
  record: NursingRecord,
  nurseName: string,
): void {
  if (!record.session) return;
  buildRoundingReport(patient, record.session, nurseName).save(
    `MediVoice_${patient.mrn}_rounding.pdf`,
  );
}
