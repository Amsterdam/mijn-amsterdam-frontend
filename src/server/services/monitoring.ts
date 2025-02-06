import * as appInsights from 'applicationinsights';
import {
  ExceptionTelemetry,
  SeverityLevel,
  Telemetry,
  TraceTelemetry,
} from 'applicationinsights/out/Declarations/Contracts';

import { IS_DEVELOPMENT } from '../../universal/config/env';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';
import { IS_DEBUG } from '../config/app';
import { log } from '../logging';

if (!IS_DEVELOPMENT && process.env.NODE_ENV !== 'test') {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setInternalLogging(false)
    .setAutoCollectRequests(true)
    .setSendLiveMetrics(false)
    .setAutoCollectPerformance(false, false)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
}

const client: appInsights.TelemetryClient | undefined =
  appInsights.defaultClient;
// See also: https://www.npmjs.com/package/applicationinsights

if (client) {
  const EXCLUDED_REQUESTS = [
    'GET /api/v1/auth/check',
    'GET /robots933456.txt',
    'POST /admin/host/ping',
    'POST /api/v1/services/telemetry/v2/track',
  ];

  client.addTelemetryProcessor((envelope) => {
    if (envelope?.data?.baseType === 'RequestData') {
      const reqData = envelope.data.baseData!;

      console.log('------REQUEST URL-----');
      console.log(reqData.url);
      console.log('-------End--------');

      if (EXCLUDED_REQUESTS.includes(reqData.url)) {
        // Do not send telemetry.
        return false;
      }
    }

    // Send telemetry.
    return true;
  });
}

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
  tags?: Telemetry['properties'];
};

export function captureException(error: unknown, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;

  const payload: ExceptionTelemetry = {
    exception: error as Error,
    properties,
    severity,
  };

  if (IS_DEVELOPMENT) {
    // Does nothing (As expected) if development is not in debug mode.
    if (IS_DEBUG) {
      log.info('Capture Exception', payload);
    }
  } else {
    client?.trackException(payload);
  }
}

export function captureMessage(message: string, properties?: Properties) {
  const severity = properties?.severity
    ? severityMap[properties.severity]
    : undefined;

  const payload: TraceTelemetry = {
    message,
    severity,
    properties,
  };

  if (IS_DEVELOPMENT) {
    // Does nothing (As expected) if development is not in debug mode.
    if (IS_DEBUG) {
      log.info('Capture message', payload);
    }
  } else {
    client?.trackTrace(payload);
  }
}

export function trackEvent(name: string, properties: Record<string, unknown>) {
  return IS_DEVELOPMENT
    ? IS_DEBUG && log.info('Track event', name, properties)
    : client?.trackEvent({
        name,
        properties,
      });
}
