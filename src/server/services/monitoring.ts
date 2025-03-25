import * as appInsights from 'applicationinsights';
import {
  ExceptionData,
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
  // Example: ["GET /api/users", ...]. This is how a 'name' is represented in telemetry data
  const excludedRequests: string[] = JSON.parse(
    process.env.MA_EXCLUDE_INCOMING_REQUESTS || '[]'
  );

  const excludedOutoingDependencies: Array<{
    method: string;
    routeSegment: string;
    statusCode: string;
  }> = JSON.parse(process.env.MA_EXCLUDE_OUTGOING_DEPENDENCIES || '[]');

  client.addTelemetryProcessor((envelope) => {
    const SEND_TELEMETRY = true;
    const DISCARD_TELEMETRY = false;

    if (!envelope.data.baseType) {
      return SEND_TELEMETRY;
    }

    switch (envelope.data.baseType) {
      case 'RequestData': {
        const reqData = envelope.data.baseData as RequestData;

        if (excludedRequests.includes(reqData.name)) {
          return DISCARD_TELEMETRY;
        }
        break;
      }
      case 'RemoteDependencyData': {
        const reqData = envelope.data.baseData as RemoteDependencyData;
        const [method, route] = reqData.name.split(' ');

        for (const excludeReqParts of excludedOutoingDependencies) {
          if (
            route.includes(excludeReqParts.routeSegment) &&
            method === excludeReqParts.method &&
            reqData.resultCode === excludeReqParts.statusCode
          ) {
            return DISCARD_TELEMETRY;
          }
        }
        break;
      }
      case 'ExceptionData': {
        const exceptionData = envelope.data.baseData as ExceptionData;
        if (
          exceptionData.exceptions.some(
            (exception) => exception.typeName === 'AxiosError'
          )
        ) {
          return DISCARD_TELEMETRY;
        }
        break;
      }
    }

    return SEND_TELEMETRY;
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
