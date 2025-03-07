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

  /** Example: "GET /api/users". This is how a 'name' is represented in telemetry data */
  type MethodWithUrl = string;

  /** Example: "404" */
  type StatusCode = string;

  let excludedRequests: MethodWithUrl[];
  try {
    excludedRequests = JSON.parse(
      process.env.MA_EXCLUDE_INCOMING_REQUESTS || '[]'
    );
  } catch (err) {
    logger.error(err);
    excludedRequests = [];
  }

  let excludedOutoingDependencies: Record<MethodWithUrl, StatusCode>;
  try {
    excludedOutoingDependencies = JSON.parse(
      process.env.MA_EXCLUDE_OUTGOING_DEPENDENCIES || '{}'
    );
  } catch (err) {
    logger.error(err);
    excludedOutoingDependencies = {};
  }

  client.addTelemetryProcessor((envelope) => {
    if (envelope?.data?.baseType === 'RequestData') {
      const reqData = envelope.data.baseData as RequestData;

      if (excludedRequests.includes(reqData.name)) {
        // Do not send telemetry.
        return false;
      }
    }

    if (envelope?.data?.baseType === 'RemoteDependencyData') {
      const reqData = envelope.data.baseData as RemoteDependencyData;

      if (excludedOutoingDependencies[reqData.name] === reqData.resultCode) {
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
