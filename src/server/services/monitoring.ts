import process from 'node:process';

import * as appInsights from 'applicationinsights';

import {
  shouldSendRemoteDependencyData,
  shouldSendRequestData,
  shouldSendExceptionData,
} from './should-send-telemetry.ts';
import { IS_DEVELOPMENT } from '../../universal/config/env.ts';
import { logger } from '../logging.ts';
import {
  ExceptionTelemetry,
  SeverityLevel,
  Telemetry,
  TraceTelemetry,
} from './monitoring-types.ts';
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
  // Reason: Type is known. It is the same type as the keyname.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shouldSendTelemetry: Record<string, (data: any) => boolean> = {
    RequestData: shouldSendRequestData,
    RemoteDependencyData: shouldSendRemoteDependencyData,
    ExceptionData: shouldSendExceptionData,
  };

  client.addTelemetryProcessor((envelope) => {
    const SEND_TELEMETRY = true;

    if (!envelope.data.baseType) {
      return SEND_TELEMETRY;
    }

    const shouldSend = shouldSendTelemetry[envelope.data.baseType];
    return shouldSend ? shouldSend(envelope.data.baseData) : SEND_TELEMETRY;
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

  logger.error(error);

  if (IS_DEVELOPMENT) {
    logger.error(error, 'Capture Exception');
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
