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
  // TODO MIJN-10074: Refactor when using validation with ZOD or other solution.

  type RouteSegment = string;
  type StatusCode = string;

  let excludedRequestsSegments: RouteSegment[];
  try {
    excludedRequestsSegments = JSON.parse(
      process.env.MA_EXCLUDE_INCOMING_REQUESTS || '[]'
    );
  } catch (err) {
    logger.error(err);
    excludedRequestsSegments = [];
  }

  let excludedOutoingDependencies: Record<RouteSegment, StatusCode>;
  try {
    excludedOutoingDependencies = JSON.parse(
      process.env.MA_EXCLUDE_OUTGOING_DEPENDENCIES || '{}'
    );
  } catch (err) {
    logger.error(err);
    excludedOutoingDependencies = {};
  }

  client.addTelemetryProcessor((envelope) => {
    const SEND_TELEMETRY = true;
    const DISCARD_TELEMTRY = false;

    if (envelope?.data?.baseType === 'RequestData') {
      const reqData = envelope.data.baseData as RequestData;

      for (const excludedSegment of excludedRequestsSegments) {
        if (reqData.name.includes(excludedSegment)) {
          return DISCARD_TELEMTRY;
        }
      }
    }

    if (envelope?.data?.baseType === 'RemoteDependencyData') {
      const reqData = envelope.data.baseData as RemoteDependencyData;

      for (const excludedNameSegment of Object.keys(
        excludedOutoingDependencies
      )) {
        if (
          reqData.name.includes(excludedNameSegment) &&
          excludedOutoingDependencies[excludedNameSegment] ===
            reqData.resultCode
        ) {
          return DISCARD_TELEMTRY;
        }
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
