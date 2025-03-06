import * as appInsights from 'applicationinsights';
import {
  ExceptionTelemetry,
  RemoteDependencyData,
  RequestData,
  SeverityLevel,
  Telemetry,
  TraceTelemetry,
} from 'applicationinsights/out/Declarations/Contracts';

import { IS_DEVELOPMENT } from '../../universal/config/env';
import { logger } from '../logging';

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
  const EXCLUDE_REQUESTS = [
    'GET /api/v1/auth/check',
    'GET /robots933456.txt',
    'GET /admin/host/status',
    'POST /admin/host/ping',
    'POST /api/v1/services/telemetry/v2/track',
  ];

  const EXCLUDE_OUTGOING_DEPENDENCY: Record<string, string> = {
    'POST /zorgned/persoonsgegevensNAW': '404',
    'POST /v2/track': '400',
  };

  client.addTelemetryProcessor((envelope) => {
    if (envelope?.data?.baseType === 'RequestData') {
      const reqData = envelope.data.baseData as RequestData;

      if (EXCLUDE_REQUESTS.includes(reqData.name)) {
        // Do not send telemetry.
        return false;
      }
    }

    if (envelope?.data?.baseType === 'RemoteDependencyData') {
      const reqData = envelope.data.baseData as RemoteDependencyData;

      if (EXCLUDE_OUTGOING_DEPENDENCY[reqData.name] === reqData.resultCode) {
        // Do not send telemetry.
        return false;
      }
    }

    // Send telemetry.
    return true;
  });

  try {
    client.config.samplingPercentage = parseInt(
      process.env.APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE ?? '100',
      10
    );
  } catch {
    client.config.samplingPercentage = 100;
  }
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
    logger.error(payload, 'Capture Exception');
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
    logger.debug(payload, 'Capture message');
  } else {
    client?.trackTrace(payload);
  }
}

export function trackEvent(name: string, properties: Record<string, unknown>) {
  return IS_DEVELOPMENT
    ? logger.debug({ name, properties }, 'Track event')
    : client?.trackEvent({
        name,
        properties,
      });
}
