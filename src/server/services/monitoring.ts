import { KnownSeverityLevel } from 'applicationinsights';
import * as appInsights from 'applicationinsights';

import { IS_DEVELOPMENT } from '../../universal/config/env';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';
import { IS_DEBUG } from '../config/app';

if (!IS_DEVELOPMENT && process.env.NODE_ENV !== 'test') {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setInternalLogging(IS_DEBUG)
    .setAutoCollectRequests(true)
    .setSendLiveMetrics(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
}

const client: appInsights.TelemetryClient | undefined =
  appInsights.defaultClient;
// See also: https://www.npmjs.com/package/applicationinsights

export type Severity =
  | 'verbose'
  | 'information'
  | 'warning'
  | 'error'
  | 'critical';

const severityMap: Record<Severity, KnownSeverityLevel> = {
  verbose: KnownSeverityLevel.Verbose,
  information: KnownSeverityLevel.Information,
  warning: KnownSeverityLevel.Warning,
  error: KnownSeverityLevel.Error,
  critical: KnownSeverityLevel.Critical,
};

export type Properties = {
  properties?: appInsights.Telemetry['properties'];
  severity?: Severity;
  tags?: appInsights.Telemetry['properties'];
};

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
    // Does nothing (As expected) if development is not in debug mode.
    if (IS_DEBUG) {
      console.log('Capture Exception', payload);
    }
  } else {
    client?.trackException(payload);
  }
}

export function captureMessage(message: string, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;

  const payload: appInsights.TraceTelemetry = {
    message,
    severity,
    properties,
  };

  if (IS_DEVELOPMENT) {
    // Does nothing (As expected) if development is not in debug mode.
    if (IS_DEBUG) {
      console.log('Capture message', payload);
    }
  } else {
    client?.trackTrace(payload);
  }
}

export function trackEvent(name: string, properties: Record<string, unknown>) {
  return IS_DEVELOPMENT
    ? MA_APP_MODE !== 'unittest' && console.log('Track event', name, properties)
    : client?.trackEvent({
        name,
        properties,
      });
}

interface TrackRequestProps {
  name: string;
  url: string;
  method?: string;
  properties?: { [key: string]: string };
}

export function trackRequest({ name, url, properties }: TrackRequestProps) {
  const startTime_ = Date.now();
  return {
    finish: (
      resultCode = HTTP_STATUS_CODES.OK,
      status: 'OK' | 'ERROR' = 'OK'
    ) => {
      if (startTime_) {
        const payload: appInsights.Contracts.RequestTelemetry = {
          url,
          success: status === 'OK',
          name,
          resultCode: String(resultCode),
          time: new Date(startTime_),
          duration: Date.now() - startTime_,
          properties,
        };

        if (IS_DEVELOPMENT) {
          // Does nothing (As expected) if development is not in debug mode.
          if (IS_DEBUG) {
            console.log('Track request', payload);
          }
        } else {
          client?.trackRequest(payload);
        }
      }
    },
  };
}
