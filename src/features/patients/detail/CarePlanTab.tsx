import { Box, Checkbox, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';
import { SectionCard } from '@/components/SectionCard';
import { PriorityChip } from '@/components/chips';
import { useAppStore } from '@/store/useAppStore';
import { useBilingual, useLang, useScopedT } from '@/i18n/I18nProvider';
import { dueIn } from '@/lib/format';
import type { CarePlanTask, Patient } from '@/types/clinical';
import { detailDict } from './dict';

interface CarePlanTabProps {
  patient: Patient;
}

function statusLabel(status: CarePlanTask['status'], t: (k: 'taskCompleted' | 'taskInProgress' | 'taskPending') => string) {
  if (status === 'completed') return t('taskCompleted');
  if (status === 'in-progress') return t('taskInProgress');
  return t('taskPending');
}

export function CarePlanTab({ patient }: CarePlanTabProps) {
  const t = useScopedT(detailDict);
  const bilingual = useBilingual();
  const { lang } = useLang();
  const setCarePlanStatus = useAppStore((s) => s.setCarePlanStatus);

  const tasks = [...patient.carePlan].sort((a, b) => +new Date(a.due) - +new Date(b.due));
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0;

  const handleToggle = (task: CarePlanTask) => {
    setCarePlanStatus(patient.id, task.id, task.status === 'completed' ? 'pending' : 'completed');
  };

  return (
    <SectionCard
      title={t('carePlanTitle')}
      subtitle={t('carePlanSubtitle')}
      icon={<ChecklistRtlOutlinedIcon fontSize="small" />}
      action={
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`${completed}/${tasks.length} ${t('completedTasks')}`}
        />
      }
    >
      <Box sx={{ mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} color="success" sx={{ height: 8 }} />
      </Box>
      <Stack spacing={1.25}>
        {tasks.map((task) => {
          const done = task.status === 'completed';
          const overdue = !done && +new Date(task.due) < Date.now();
          return (
            <Stack
              key={task.id}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              sx={(theme) => ({
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: done ? alpha(theme.palette.success.main, 0.06) : 'transparent',
                transition: 'background-color 120ms ease',
              })}
            >
              <Checkbox
                checked={done}
                onChange={() => handleToggle(task)}
                color="success"
                sx={{ p: 0.5, mt: -0.25 }}
                inputProps={{ 'aria-label': task.description }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={bilingual(task.category)}
                      sx={{ fontWeight: 700 }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : 'text.primary' }}
                    >
                      {task.description}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PriorityChip priority={task.priority} />
                  </Stack>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ color: overdue ? 'error.main' : 'text.secondary', fontWeight: overdue ? 700 : 400 }}
                >
                  {t('due')} {dueIn(task.due, lang)} · {statusLabel(task.status, t)}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </SectionCard>
  );
}
