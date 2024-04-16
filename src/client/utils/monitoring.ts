import { IS_DEVELOPMENT } from '../../universal/config/env';
import { useScript } from '../hooks/useScript';

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

interface AppInsights {
  trackException(payload: Record<string, any>): void;
  trackTrace(payload: Record<string, any>): void;
  trackPageView(): void;
}

let appInsights: AppInsights;

export function useMonitoring() {
  const [isAppInsightsLoaded] = useScript({
    src: '/js/app-insights-2024-03-07.js',
    defer: false,
    async: true,
    isEnabled: true,
    onLoadCallback: initAppInsights,
  });

  function initAppInsights() {
    const snippet = {
      config: {
        connectionString: import.meta.env
          .REACT_APP_MONITORING_CONNECTION_STRING,
      },
    };
    const init = new (
      window as any
    ).Microsoft.ApplicationInsights.ApplicationInsights(snippet);

    appInsights = init?.loadAppInsights();
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
