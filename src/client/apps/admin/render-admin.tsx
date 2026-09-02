import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { ApplicationError } from './ApplicationError.tsx';
import { reactPlugin } from '../../helpers/monitoring.ts';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <App />
  </AppInsightsErrorBoundary>
);
