import { create } from 'zustand';
import { getInitialDataset } from '@/data/seed';
import type {
  CarePlanTask,
  Nurse,
  NursingRecord,
  Patient,
  ScheduledRound,
} from '@/types/clinical';

interface AppState {
  currentNurse: Nurse;
  patients: Patient[];
  records: NursingRecord[];
  schedule: ScheduledRound[];

  addRecord: (record: NursingRecord) => void;
  signRecord: (id: string) => void;
  completeScheduledRound: (id: string) => void;
  addScheduledRound: (round: ScheduledRound) => void;
  setCarePlanStatus: (patientId: string, taskId: string, status: CarePlanTask['status']) => void;
}

const initial = getInitialDataset();

export const useAppStore = create<AppState>((set) => ({
  currentNurse: initial.currentNurse,
  patients: initial.patients,
  records: initial.records,
  schedule: initial.schedule,

  addRecord: (record) => set((s) => ({ records: [record, ...s.records] })),

  signRecord: (id) =>
    set((s) => ({ records: s.records.map((r) => (r.id === id ? { ...r, signed: true } : r)) })),

  completeScheduledRound: (id) =>
    set((s) => ({
      schedule: s.schedule.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)),
    })),

  addScheduledRound: (round) =>
    set((s) => ({
      schedule: [...s.schedule, round].sort(
        (a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt),
      ),
    })),

  setCarePlanStatus: (patientId, taskId, status) =>
    set((s) => ({
      patients: s.patients.map((p) =>
        p.id === patientId
          ? { ...p, carePlan: p.carePlan.map((t) => (t.id === taskId ? { ...t, status } : t)) }
          : p,
      ),
    })),
}));

/* ----------------------------- selector hooks ---------------------------- */

export const useCurrentNurse = (): Nurse => useAppStore((s) => s.currentNurse);
export const usePatients = (): Patient[] => useAppStore((s) => s.patients);
export const usePatientById = (id?: string): Patient | undefined =>
  useAppStore((s) => s.patients.find((p) => p.id === id));
export const useSchedule = (): ScheduledRound[] => useAppStore((s) => s.schedule);
export const useAllRecords = (): NursingRecord[] => useAppStore((s) => s.records);
