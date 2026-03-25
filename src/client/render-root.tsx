import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';
import { createRoot } from 'react-dom/client';

import { AppWrapper } from './App.tsx';
import { reactPlugin } from './helpers/monitoring.ts';
import { ApplicationError } from './pages/ApplicationError/ApplicationError.tsx';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <AppWrapper />
  </AppInsightsErrorBoundary>
);
