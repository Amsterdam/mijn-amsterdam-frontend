import * as appInsights from 'applicationinsights';
import { SeverityLevel } from 'applicationinsights/out/Declarations/Contracts';
import { Telemetry } from 'applicationinsights/out/Declarations/Contracts/TelemetryTypes/Telemetry';
import { IS_DEVELOPMENT } from '../../universal/config/env';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';
import { IS_DEBUG } from '../config/app';
import { KnownSeverityLevel, Telemetry } from 'applicationinsights';

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
  properties?: Telemetry['properties'];
  severity?: Severity;
  tags?: Telemetry['properties'];
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

  IS_DEVELOPMENT
    ? IS_DEBUG && console.log('Capture Exception', payload)
    : client?.trackException(payload);
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

  IS_DEVELOPMENT
    ? IS_DEBUG && console.log('Capture message', payload)
    : client?.trackTrace(payload);
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

        IS_DEVELOPMENT
          ? IS_DEBUG && console.log('Track request', payload)
          : client?.trackRequest(payload);
      }
    },
  };
}
