import type { ElementType } from 'react';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { commonDict } from '@/i18n/common.i18n';

export interface NavItem {
  labelKey: keyof typeof commonDict;
  path: string;
  icon: ElementType;
}

export interface NavSection {
  titleKey: keyof typeof commonDict;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: 'sectionClinical',
    items: [
      { labelKey: 'navDashboard', path: '/', icon: SpaceDashboardOutlinedIcon },
      { labelKey: 'navPatients', path: '/patients', icon: PeopleAltOutlinedIcon },
      { labelKey: 'navRounds', path: '/rounds', icon: RecordVoiceOverOutlinedIcon },
    ],
  },
  {
    titleKey: 'sectionDocumentation',
    items: [
      { labelKey: 'navRecords', path: '/records', icon: DescriptionOutlinedIcon },
      { labelKey: 'navSchedule', path: '/schedule', icon: EventNoteOutlinedIcon },
      { labelKey: 'navReports', path: '/reports', icon: PictureAsPdfOutlinedIcon },
    ],
  },
  {
    titleKey: 'sectionInsights',
    items: [
      { labelKey: 'navResearch', path: '/research', icon: InsightsOutlinedIcon },
      { labelKey: 'navSettings', path: '/settings', icon: SettingsOutlinedIcon },
    ],
  },
];

export const SIDEBAR_WIDTH = 264;
