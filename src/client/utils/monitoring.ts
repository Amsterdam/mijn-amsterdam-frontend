import { IS_DEVELOPMENT } from '../../universal/config/env';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

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
  properties?: Record<string, any>;
  severity?: Severity;
};

const browserHistory = createBrowserHistory({ basename: '' });

export const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.REACT_APP_MONITORING_CONNECTION_STRING,
    extensions: [reactPlugin],
    enableAutoRouteTracking: true,
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
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

  IS_DEVELOPMENT
    ? MA_APP_MODE !== 'unittest' && console.log('Capture exception', payload)
    : appInsights.trackException(payload);
}

export function captureMessage(message: string, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;

  const payload = { message, severity, properties };

  IS_DEVELOPMENT
    ? MA_APP_MODE !== 'unittest' && console.log('Capture message', payload)
    : appInsights.trackTrace(payload);
}

export function trackEvent(name: string, properties: Record<string, any>) {
  return IS_DEVELOPMENT
    ? MA_APP_MODE !== 'unittest' && console.log('Track event', name, properties)
    : appInsights.trackEvent({
        name,
        properties,
      });
}
