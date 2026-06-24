import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ColorModeProvider } from '@/theme/ColorModeProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { App } from './App';

export function AppRoot() {
  return (
    <ColorModeProvider>
      <I18nProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocalizationProvider>
      </I18nProvider>
    </ColorModeProvider>
  );
}
