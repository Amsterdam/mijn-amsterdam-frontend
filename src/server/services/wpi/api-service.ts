import {
  apiErrorResult,
  apiSuccesResult,
  ApiSuccessResponse,
} from '../../../universal/helpers';
import { MyNotification, StatusLine } from '../../../universal/types';
import { getApiConfig, SourceApiKey } from '../../config';
import { requestData } from '../../helpers';
import { requestProcess as bbzRequestProcessLabels } from './content/bbz';
import { requestProcess as bijstandsuitkeringRequestProcessLabels } from './content/bijstandsuitkering';
import { requestProcess as stadspasRequestProcessLabels } from './content/stadspas';
import { requestProcess as tonkRequestProcessLabels } from './content/tonk';
import { requestProcess as tozoRequestProcessLabels } from './content/tozo';
import { WpiRequestProcess, WpiRequestProcessLabels } from './focus-types';
import { transformToStatusLine } from './helpers';

function fetchRequestProcess<R extends WpiRequestProcess>(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  apiConfigName: SourceApiKey,
  labels: WpiRequestProcessLabels
) {
  const response = requestData<StatusLine[]>(
    getApiConfig(apiConfigName, {
      transformResponse: (response: ApiSuccessResponse<R[]>) =>
        response.content.map((requestProcess) =>
          transformToStatusLine(requestProcess, labels)
        ),
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export function fetchBijstandsuitkering(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    'WPI_AANVRAGEN',
    bijstandsuitkeringRequestProcessLabels
  );
}

export async function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const aanvragenRequest = fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    'WPI_AANVRAGEN',
    stadspasRequestProcessLabels
  );

  const stadspassenRequest = requestData<StatusLine[]>(
    getApiConfig('WPI_STADSPAS'),
    sessionID,
    passthroughRequestHeaders
  );

  const [aanvragenResult, stadspassenResult] = await Promise.all([
    aanvragenRequest,
    stadspassenRequest,
  ]);

  // TODO: Fix partial errors
  return apiSuccesResult({
    aanvragen: aanvragenResult.content,
    stadspassen: stadspassenResult.content,
  });
}

export function fetchTozo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    'WPI_E_AANVRAGEN',
    tozoRequestProcessLabels
  );
}

export function fetchBbz(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    'WPI_E_AANVRAGEN',
    bbzRequestProcessLabels
  );
}

export function fetchTonk(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    'WPI_E_AANVRAGEN',
    tonkRequestProcessLabels
  );
}

export function fetchSpecificaties(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = requestData<StatusLine[]>(
    getApiConfig('WPI_SPECIFICATIES'),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export function fetchBijstandsuitkeringGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchStadspasGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchSpecificationsGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchTozoGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchTonkGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchBbzGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export async function fetchNotificationsAndRecentCases(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  // const WPI_AANVRAGEN = await fetchAanvragen(
  //   sessionID,
  //   passthroughRequestHeaders
  // );
  // const compareDate = new Date();

  // let notifications: MyNotification[] = [];
  // let cases: MyCase[] = [];

  // if (WPI_AANVRAGEN.status === 'OK') {
  //   const items = WPI_AANVRAGEN.content;
  //   notifications = items
  //     .filter(
  //       (item) =>
  //         !IS_PRODUCTION ||
  //         isNotificationActual(item.datePublished, compareDate)
  //     )
  //     .map(createFocusNotification);

  //   cases = items
  //     .filter(
  //       (item) =>
  //         isRecentCase(item.datePublished, compareDate) ||
  //         item.status !== 'besluit'
  //     )
  //     .map(createFocusRecentCase)
  //     .filter((recentCase) => recentCase !== null);

  //   return apiSuccesResult({
  //     cases,
  //     notifications,
  //   });
  // }

  return apiErrorResult('Not implemented', null);
}
