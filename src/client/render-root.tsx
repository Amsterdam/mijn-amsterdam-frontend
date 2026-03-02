import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';
import { createRoot } from 'react-dom/client';

import { AppWrapper } from './App';
import { reactPlugin } from './helpers/monitoring';
import { ApplicationError } from './pages/ApplicationError/ApplicationError';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <AppWrapper />
  </AppInsightsErrorBoundary>
);
