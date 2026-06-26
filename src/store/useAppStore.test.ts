import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import type { NursingRecord, ScheduledRound } from '@/types/clinical';

const initial = useAppStore.getState();

function makeRecord(id: string, patientId: string, signed = false): NursingRecord {
  return {
    id,
    patientId,
    type: 'narrative',
    createdAt: new Date().toISOString(),
    author: 'Test RN',
    shift: 'Day',
    signed,
    narrative: 'Test note.',
  };
}

function makeRound(id: string, scheduledAt: string): ScheduledRound {
  return {
    id,
    patientId: 'pt-001',
    scheduledAt,
    questionSetId: 'set-standard',
    assignedNurse: 'Test RN',
    status: 'scheduled',
  };
}

describe('useAppStore reducers', () => {
  beforeEach(() => {
    // Restore the seeded baseline before each test (actions never mutate in place).
    useAppStore.setState({
      patients: initial.patients,
      records: initial.records,
      schedule: initial.schedule,
    });
  });

  it('addRecord prepends the new record', () => {
    const before = useAppStore.getState().records.length;
    useAppStore.getState().addRecord(makeRecord('rec-new', 'pt-001'));
    const records = useAppStore.getState().records;
    expect(records).toHaveLength(before + 1);
    expect(records[0].id).toBe('rec-new');
  });

  it('signRecord marks only the matching record as signed', () => {
    useAppStore.setState({
      records: [makeRecord('rec-a', 'pt-001'), makeRecord('rec-b', 'pt-002')],
    });
    useAppStore.getState().signRecord('rec-a');
    const records = useAppStore.getState().records;
    expect(records.find((r) => r.id === 'rec-a')?.signed).toBe(true);
    expect(records.find((r) => r.id === 'rec-b')?.signed).toBe(false);
  });

  it('completeScheduledRound flips status to completed', () => {
    useAppStore.setState({ schedule: [makeRound('sched-x', new Date().toISOString())] });
    useAppStore.getState().completeScheduledRound('sched-x');
    expect(useAppStore.getState().schedule[0].status).toBe('completed');
  });

  it('addScheduledRound inserts in chronological order', () => {
    const t = (h: number) => new Date(`2026-06-27T${String(h).padStart(2, '0')}:00:00.000Z`).toISOString();
    useAppStore.setState({ schedule: [makeRound('sched-1', t(9)), makeRound('sched-3', t(15))] });
    useAppStore.getState().addScheduledRound(makeRound('sched-2', t(12)));
    const order = useAppStore.getState().schedule.map((r) => r.id);
    expect(order).toEqual(['sched-1', 'sched-2', 'sched-3']);
  });

  it('setCarePlanStatus updates the targeted task without touching others', () => {
    const patient = initial.patients[0];
    const task = patient.carePlan[0];
    useAppStore.getState().setCarePlanStatus(patient.id, task.id, 'completed');

    const updated = useAppStore.getState().patients.find((p) => p.id === patient.id);
    expect(updated?.carePlan.find((task1) => task1.id === task.id)?.status).toBe('completed');

    // A different patient's care plan is unchanged.
    const other = initial.patients[1];
    const otherNow = useAppStore.getState().patients.find((p) => p.id === other.id);
    expect(otherNow?.carePlan.map((c) => c.status)).toEqual(other.carePlan.map((c) => c.status));
  });
});
