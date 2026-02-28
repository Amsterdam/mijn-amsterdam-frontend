import { AppInsightsErrorBoundary } from '@microsoft/applicationinsights-react-js';
import { createRoot } from 'react-dom/client';

import { AppWrapper } from './client/App';
import { reactPlugin } from './client/helpers/monitoring';
import { ApplicationError } from './client/pages/ApplicationError/ApplicationError';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppInsightsErrorBoundary
    onError={ApplicationError}
    appInsights={reactPlugin}
  >
    <AppWrapper />
  </AppInsightsErrorBoundary>
);
