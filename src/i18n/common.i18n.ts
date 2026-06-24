import type { Dictionary } from './I18nProvider';

/** Shared strings used by the application chrome and across multiple screens. */
export const commonDict = {
  appName: { en: 'MediVoice', ko: 'MediVoice' },
  appTagline: {
    en: 'AI-Speaker Nursing Information System',
    ko: 'AI 스피커 기반 간호정보시스템',
  },

  // Navigation
  navDashboard: { en: 'Dashboard', ko: '대시보드' },
  navPatients: { en: 'Patients', ko: '환자 목록' },
  navRounds: { en: 'Voice Rounds', ko: '음성 회진' },
  navRecords: { en: 'Nursing Records', ko: '간호기록' },
  navSchedule: { en: 'Schedule', ko: '스케줄' },
  navReports: { en: 'Reports', ko: '보고서' },
  navResearch: { en: 'Research', ko: '연구 결과' },
  navSettings: { en: 'Settings', ko: '설정' },

  sectionClinical: { en: 'Clinical', ko: '임상' },
  sectionDocumentation: { en: 'Documentation', ko: '문서화' },
  sectionInsights: { en: 'Insights', ko: '인사이트' },

  // Common actions
  save: { en: 'Save', ko: '저장' },
  cancel: { en: 'Cancel', ko: '취소' },
  close: { en: 'Close', ko: '닫기' },
  search: { en: 'Search', ko: '검색' },
  export: { en: 'Export', ko: '내보내기' },
  exportPdf: { en: 'Export PDF', ko: 'PDF 내보내기' },
  print: { en: 'Print', ko: '인쇄' },
  edit: { en: 'Edit', ko: '편집' },
  view: { en: 'View', ko: '보기' },
  start: { en: 'Start', ko: '시작' },
  stop: { en: 'Stop', ko: '정지' },
  sign: { en: 'Sign', ko: '서명' },
  viewAll: { en: 'View all', ko: '전체 보기' },
  noData: { en: 'No data available', ko: '데이터가 없습니다' },

  // Chrome
  searchPlaceholder: { en: 'Search patients, MRN, room…', ko: '환자, 등록번호, 병실 검색…' },
  language: { en: 'Language', ko: '언어' },
  theme: { en: 'Theme', ko: '테마' },
  lightMode: { en: 'Light', ko: '라이트' },
  darkMode: { en: 'Dark', ko: '다크' },
  signedInAs: { en: 'Signed in as', ko: '로그인 계정' },
  onShift: { en: 'On shift', ko: '근무 중' },

  // Time / shift
  shiftDay: { en: 'Day shift', ko: '주간 근무' },
  shiftEvening: { en: 'Evening shift', ko: '저녁 근무' },
  shiftNight: { en: 'Night shift', ko: '야간 근무' },
} satisfies Dictionary;
