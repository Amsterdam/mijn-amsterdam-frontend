import { createRoot } from 'react-dom/client';

import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';

import { reactPlugin } from '../../helpers/monitoring.ts';
import { App } from './App.tsx';
import { ApplicationError } from './ApplicationError.tsx';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <App />
  </AppInsightsErrorBoundary>
);
