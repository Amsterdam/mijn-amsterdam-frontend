import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';

import { IS_DEVELOPMENT } from '../../universal/config/env.ts';

export type Severity =
  | 'verbose'
  | 'information'
  | 'warning'
  | 'error'
  | 'critical';

const severityMap: Record<Severity, string> = {
  verbose: 'Verbose',
  information: 'Information',
  warning: 'Warning',
  error: 'Error',
  critical: 'Critical',
};

export type Properties = {
  properties?: Record<string, unknown>;
  severity?: Severity;
};

const browserHistory = createBrowserHistory();

export const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.REACT_APP_MONITORING_CONNECTION_STRING,
    extensions: [reactPlugin],
    enableAutoRouteTracking: true,
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
      ['AppInsightsCfgSyncPlugin']: {
        cfgUrl: '', // this will block fetching from default cdn
      },
    },
  },
});

export function useMonitoring() {
  if (import.meta.env.REACT_APP_MONITORING_CONNECTION_STRING) {
    appInsights.loadAppInsights();
  }
}

export function captureException(error: unknown, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;
  const payload = {
    exception: error as Error,
    severity,
    properties,
  };

  if (IS_DEVELOPMENT) {
    if (MA_APP_MODE !== 'unittest') {
      console.log('Capture exception', payload);
    }
  } else {
    appInsights.trackException(payload);
  }
}

export function captureMessage(message: string, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;

  const payload = { message, severity, properties };

  if (IS_DEVELOPMENT) {
    if (MA_APP_MODE !== 'unittest') {
      console.log('Capture message', payload);
    }
  } else {
    appInsights.trackTrace(payload);
  }
}

export function trackEvent(name: string, properties: Record<string, unknown>) {
  return IS_DEVELOPMENT
    ? MA_APP_MODE !== 'unittest' && console.log('Track event', name, properties)
    : appInsights.trackEvent({
        name,
        properties,
      });
}
