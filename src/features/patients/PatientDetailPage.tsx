import { useMemo, useState } from 'react';
import { Box, Button, Stack, Tab, Tabs } from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { usePatientById } from '@/store/useAppStore';
import { useScopedT } from '@/i18n/I18nProvider';
import { downloadPatientReport } from '@/lib/pdf';
import { detailDict } from './detail/dict';
import { PatientBanner } from './detail/PatientBanner';
import { OverviewTab } from './detail/OverviewTab';
import { VitalsTab } from './detail/VitalsTab';
import { LabsTab } from './detail/LabsTab';
import { MedicationsTab } from './detail/MedicationsTab';
import { NandaTab } from './detail/NandaTab';
import { AssessmentTab } from './detail/AssessmentTab';
import { CarePlanTab } from './detail/CarePlanTab';
import { RecordsTab } from './detail/RecordsTab';

export function PatientDetailPage() {
  const { patientId } = useParams();
  const patient = usePatientById(patientId);
  const navigate = useNavigate();
  const t = useScopedT(detailDict);
  const [tab, setTab] = useState(0);

  const tabs = useMemo(
    () =>
      [
        { key: 'tabOverview' as const, render: () => <OverviewTab patient={patient!} /> },
        { key: 'tabVitals' as const, render: () => <VitalsTab patient={patient!} /> },
        { key: 'tabLabs' as const, render: () => <LabsTab patient={patient!} /> },
        { key: 'tabMeds' as const, render: () => <MedicationsTab patient={patient!} /> },
        { key: 'tabNanda' as const, render: () => <NandaTab patient={patient!} /> },
        { key: 'tabAssessment' as const, render: () => <AssessmentTab patient={patient!} /> },
        { key: 'tabCarePlan' as const, render: () => <CarePlanTab patient={patient!} /> },
        { key: 'tabRecords' as const, render: () => <RecordsTab patient={patient!} /> },
      ],
    [patient],
  );

  if (!patient) {
    return (
      <>
        <PageHeader title={t('notFoundTitle')} />
        <EmptyState
          icon={<PersonOffOutlinedIcon />}
          title={t('notFoundTitle')}
          description={t('notFoundDesc')}
          action={
            <Button
              component={RouterLink}
              to="/patients"
              variant="contained"
              startIcon={<ArrowBackRoundedIcon />}
            >
              {t('backToRoster')}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={patient.name}
        subtitle={`${t('mrn')} ${patient.mrn} · ${patient.ward.code} ${patient.room}-${patient.bed}`}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate('/patients')}
            >
              {t('backToRoster')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfOutlinedIcon />}
              onClick={() => downloadPatientReport(patient)}
            >
              {t('exportPdf')}
            </Button>
            <Button
              variant="contained"
              startIcon={<RecordVoiceOverOutlinedIcon />}
              onClick={() => navigate(`/rounds/${patient.id}`)}
            >
              {t('startVoiceRound')}
            </Button>
          </>
        }
      />

      <Stack spacing={2.5}>
        <PatientBanner patient={patient} />

        <Box
          sx={(theme) => ({
            position: 'sticky',
            top: 0,
            zIndex: 2,
            bgcolor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Tabs
            value={tab}
            onChange={(_, v: number) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {tabs.map((item) => (
              <Tab key={item.key} label={t(item.key)} />
            ))}
          </Tabs>
        </Box>

        <Box>{tabs[tab].render()}</Box>
      </Stack>
    </>
  );
}
