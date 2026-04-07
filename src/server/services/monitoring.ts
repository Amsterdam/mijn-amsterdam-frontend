import appInsights from 'applicationinsights';
import {
  type ExceptionTelemetry,
  type Telemetry,
  type TraceTelemetry,
  SeverityLevel,
} from 'applicationinsights/out/Declarations/Contracts/index.js';

import {
  shouldSendRemoteDependencyData,
  shouldSendRequestData,
  shouldSendExceptionData,
} from './should-send-telemetry.ts';
import { logger } from '../logging.ts';

const logToApplicationInsights =
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING &&
  process.env.NODE_ENV !== 'test';

if (logToApplicationInsights) {
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

export function getContextOperationId(
  fallbackId: string = 'correlation-id-not-in-context'
): string | undefined {
  return (
    appInsights.getCorrelationContext()?.operation.id ??
    `mijn-amsterdam-${fallbackId}`
  );
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

  if (!logToApplicationInsights) {
    logger.error(error, 'Capture Exception');
  }
  client?.trackException(payload);
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

  if (!logToApplicationInsights) {
    logger.debug(payload, 'Capture message');
  }
  client?.trackTrace(payload);
}

export function trackEvent(name: string, properties: Record<string, unknown>) {
  if (!logToApplicationInsights) {
    logger.debug({ name, properties }, 'Track event');
    return;
  }
  client?.trackEvent({
    name,
    properties,
  });
}
