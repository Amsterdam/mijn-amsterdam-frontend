import * as appInsights from 'applicationinsights';
import { SeverityLevel } from 'applicationinsights/out/Declarations/Contracts';
import { Telemetry } from 'applicationinsights/out/Declarations/Contracts/TelemetryTypes/Telemetry';
import { IS_DEVELOPMENT } from '../../universal/config';
import { IS_DEBUG } from '../config';

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

const client = appInsights.defaultClient;
// See also: https://www.npmjs.com/package/applicationinsights

export type Severity =
  | 'verbose'
  | 'information'
  | 'warning'
  | 'error'
  | 'critical';

const severityMap: Record<Severity, SeverityLevel> = {
  verbose: SeverityLevel.Verbose,
  information: SeverityLevel.Information,
  warning: SeverityLevel.Warning,
  error: SeverityLevel.Error,
  critical: SeverityLevel.Critical,
};

export type Properties = {
  properties?: Telemetry['properties'];
  severity?: Severity;
  tags?: Telemetry['tagOverrides'];
};

export function captureException(error: unknown, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;
  const tagOverrides = properties?.tags;
  const payload = {
    exception: error as Error,
    severity,
    tagOverrides,
    properties,
  };

  IS_DEVELOPMENT
    ? IS_DEBUG && console.log('Capture Exception', payload)
    : client.trackException(payload);
}

export function captureMessage(message: string, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;

  const tagOverrides = properties?.tags;
  const payload = { message, severity, tagOverrides, properties };

  IS_DEVELOPMENT
    ? IS_DEBUG && console.log('Capture message', payload)
    : client.trackTrace(payload);
}

interface TrackRequestProps {
  name: string;
  url: string;
  method?: string;
  properties?: { [key: string]: string };
}

export function trackRequest({
  name,
  url,
  method = 'get',
  properties,
}: TrackRequestProps) {
  let startTime_ = Date.now();
  return {
    finish: (resultCode: number = 200, status: 'OK' | 'ERROR' = 'OK') => {
      if (startTime_) {
        const payload = {
          url,
          success: status === 'OK',
          name,
          resultCode,
          time: new Date(startTime_),
          duration: Date.now() - startTime_,
          properties,
        };

        IS_DEVELOPMENT
          ? IS_DEBUG && console.log('Track request', payload)
          : client.trackRequest(payload);
      }
    },
  };
}
