import { RemoteDependencyData } from '@microsoft/applicationinsights-web';
import {
  ExceptionData,
  RequestData,
} from 'applicationinsights/out/Declarations/Contracts';
import process from "node:process";

// Example: ["GET /api/users", ...]. This is how a 'name' is represented in telemetry data
const excludedRequests: string[] = JSON.parse(
  process.env.BFF_EXCLUDE_INCOMING_REQUESTS || '[]'
);

export function shouldSendRequestData(data: RequestData) {
  return !excludedRequests.includes(data.name);
}

const excludedOutoingDependencies: Array<{
  method: string;
  routeSegment: string;
  statusCode: string;
}> = JSON.parse(process.env.BFF_EXCLUDE_OUTGOING_DEPENDENCIES || '[]');

export function shouldSendRemoteDependencyData(data: RemoteDependencyData) {
  const [method, route] = data.name.split(' ');

  for (const excludeReqParts of excludedOutoingDependencies) {
    if (
      route.includes(excludeReqParts.routeSegment) &&
      method === excludeReqParts.method &&
      data.resultCode === excludeReqParts.statusCode
    ) {
      return false;
    }
  }
  return true;
}

// Exceptions like "AxiosError: Request failed" are loaded in here.
const excludedExceptions: string[] = JSON.parse(
  process.env.BFF_EXCLUDE_EXCEPTIONS || '[]'
);

export function shouldSendExceptionData(data: ExceptionData) {
  const exceptionSource = data.exceptions.at(-1);
  return !(
    !!exceptionSource &&
    excludedExceptions.some((exceptionTextStart) =>
      exceptionSource.message.startsWith(exceptionTextStart)
    )
  );
}
