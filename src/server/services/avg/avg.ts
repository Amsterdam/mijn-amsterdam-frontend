import FormData from 'form-data';
import { generatePath } from 'react-router';

import { getAvgStatusLineItems } from './avg-status-line-items';
import {
  AVGRequestFrontend,
  AVGResponse,
  AvgThemesResponse,
  SmileAvgResponse,
  SmileAvgThemesResponse,
} from './types';
import {
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/AVG/AVG-thema-config';
import {
  ApiSuccessResponse,
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { smileDateParser } from '../smile/smile-helpers';

const DEFAULT_PAGE_SIZE = 25;

function getDataForAVG(bsn: string) {
  const data = new FormData();
  data.append('username', process.env.BFF_SMILE_USERNAME);
  data.append('password', process.env.BFF_SMILE_PASSWORD);
  data.append('function', 'readAVGverzoek');

  const columns = [
    'avgverzoek_id',
    'avgverzoek_status',
    'avgverzoek_alias',
    'avgverzoek_datuminbehandeling',
    'avgverzoek_typeverzoek',
    'avgverzoek_datumbinnenkomst',
    'avgverzoek_opschortengestartop',
    'avgverzoek_datuminbehandeling',
    'avgverzoek_werkelijkeeinddatum',
    'avgverzoek_omschrijvingvanonderwerp',
    'avgverzoek_statusavgverzoek_alias',
    'avgverzoek_typeafhandelingvaststellen_resultaat',
  ].join(', ');

  data.append('columns', columns);
  data.append(
    'filters',
    `avgverzoek.bsn='${bsn}' AND avgverzoek.datumbinnenkomst > Session.NOW[-1,year]`
  );

  data.append('pagesize', DEFAULT_PAGE_SIZE);
  data.append('orderbys', 'avgverzoek_id desc');

  return data;
}

function getDataForAvgThemas(avgIds: string[]) {
  const data = new FormData();

  data.append('username', process.env.BFF_SMILE_USERNAME);
  data.append('password', process.env.BFF_SMILE_PASSWORD);
  data.append('function', 'readthemaperavgverzoek');

  const columns = [
    'themaperavgverzoek_avgthema_omschrijving',
    'themaperavgverzoek_avgverzoek_id',
  ].join(', ');

  data.append('columns', columns);
  data.append(
    'filters',
    `themaperavgverzoek.avgverzoek.id IN ('${avgIds.join("', '")}')`
  );
  const MAX_AMOUNT_OF_THEMES = 14;
  data.append('pagesize', MAX_AMOUNT_OF_THEMES * DEFAULT_PAGE_SIZE);

  data.append('orderbys', 'themaperavgverzoek_avgverzoek_id desc');

  return data;
}

export async function enrichAvgResponse(
  avgResponse: ApiSuccessResponse<AVGResponse>
) {
  const avgIds = avgResponse.content.verzoeken.map((verzoek) => verzoek.id);
  const themasResponse = await fetchAVGRequestThemes(avgIds);

  if (themasResponse.status === 'OK') {
    const enrichedAvgRequests: AVGRequestFrontend[] = [];

    for (const avgRequest of avgResponse.content.verzoeken) {
      const themasPerVerzoek = themasResponse.content.verzoeken.filter(
        (verzoek) => verzoek.avgVerzoekId === avgRequest.id
      );

      const enrichedAvgRequest = {
        ...avgRequest,
        themas: themasPerVerzoek
          .map((theme) => theme.themaOmschrijving)
          .filter((theme: string | null): theme is string => theme !== null)
          .join(', '),
      };

      enrichedAvgRequests.push(enrichedAvgRequest);
    }

    return apiSuccessResult({
      ...avgResponse.content,
      verzoeken: enrichedAvgRequests,
    });
  }

  return avgResponse;
}

export function transformAVGResponse(data: SmileAvgResponse): AVGResponse {
  if (!data.List || data.rowcount === 0) {
    return {
      aantal: 0,
      verzoeken: [],
    };
  }
  const verzoeken = data.List.map((verzoek) => {
    const id = verzoek.avgverzoek_id?.value || '';
    const title = `AVG verzoek ${id}`;
    const ontvangstDatum = smileDateParser(
      verzoek.avgverzoek_datumbinnenkomst.value || ''
    );
    const request: AVGRequestFrontend = {
      id,
      title,
      displayStatus: verzoek.avgverzoek_statusavgverzoek_alias.value || '',
      registratieDatum: smileDateParser(
        verzoek.avgverzoek_datuminbehandeling?.value || ''
      ),
      type: verzoek.avgverzoek_typeverzoek.value || '',
      toelichting: verzoek.avgverzoek_omschrijvingvanonderwerp?.value || '',
      resultaat:
        verzoek.avgverzoek_typeafhandelingvaststellen_resultaat?.value || '',
      ontvangstDatum: ontvangstDatum,
      ontvangstDatumFormatted: ontvangstDatum
        ? defaultDateFormat(ontvangstDatum)
        : ontvangstDatum,
      opschortenGestartOp: smileDateParser(
        verzoek.avgverzoek_opschortengestartop?.value || ''
      ),
      datumInBehandeling: smileDateParser(
        verzoek.avgverzoek_datuminbehandeling?.value || ''
      ),
      datumAfhandeling: smileDateParser(
        verzoek.avgverzoek_werkelijkeeinddatum?.value || ''
      ),
      // Is filled later on.
      themas: '',
      steps: [],
      link: {
        to: generatePath(routeConfig.detailPage.path, {
          id,
        }),
        title,
      },
    };

    const steps = getAvgStatusLineItems(request);

    return { ...request, steps };
  });

  const response: AVGResponse = {
    verzoeken,
    aantal: data.rowcount,
  };

  return response;
}

export async function fetchAVG(authProfileAndToken: AuthProfileAndToken) {
  const data = getDataForAVG(authProfileAndToken.profile.id);
  const response = await requestData<AVGResponse>(
    getApiConfig('ENABLEU_2_SMILE', {
      transformResponse: transformAVGResponse,
      data,
      headers: data.getHeaders(),
      cacheKey_UNSAFE: createSessionBasedCacheKey(
        authProfileAndToken.profile.sid
      ),
      postponeFetch: !featureToggle.avgActive,
    })
  );

  if (response.status === 'OK') {
    return enrichAvgResponse(response);
  }

  return response;
}

export function transformAVGThemeResponse(
  data: SmileAvgThemesResponse
): AvgThemesResponse {
  if (!data.List || data.rowcount === 0) {
    return {
      verzoeken: [],
    };
  }

  return {
    verzoeken: data.List.map((avgTheme) => ({
      avgVerzoekId: avgTheme.themaperavgverzoek_avgverzoek_id.value,
      themaOmschrijving:
        avgTheme.themaperavgverzoek_avgthema_omschrijving.value,
    })),
  };
}

export async function fetchAVGRequestThemes(
  avgIds: AVGRequestFrontend['id'][]
) {
  const data = getDataForAvgThemas(avgIds);

  const res = await requestData<AvgThemesResponse>(
    getApiConfig('ENABLEU_2_SMILE', {
      transformResponse: transformAVGThemeResponse,
      data,
      headers: data.getHeaders(),
      cacheKey_UNSAFE: avgIds.join(), // These are unique per user.
      postponeFetch: !featureToggle.avgActive,
    })
  );

  return res;
}

// fetchNotificaties
export async function fetchAVGNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const AVG = await fetchAVG(authProfileAndToken);

  if (AVG.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(AVG.content.verzoeken)
      ? AVG.content.verzoeken.map(createAVGNotification)
      : [];

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ AVG });
}

function createAVGNotification(verzoek: AVGRequestFrontend) {
  const isDone = !!verzoek.datumAfhandeling;
  const extraInfoActive = !!verzoek.opschortenGestartOp;
  const inProgressActive = !!verzoek.datumInBehandeling;

  const notification: MyNotification = {
    themaID: themaId,
    themaTitle: themaTitle,
    id: `avg-${verzoek.id}-notification`,
    title: 'AVG verzoek ontvangen',
    description: `Wij hebben uw AVG verzoek met gemeentelijk zaaknummer ${verzoek.id} ontvangen.`,
    datePublished: verzoek.ontvangstDatum,
    link: {
      to: verzoek.link.to,
      title: 'Bekijk details',
    },
  };

  if (inProgressActive) {
    notification.title = 'AVG verzoek in behandeling';
    notification.description = `Wij hebben uw AVG verzoek met gemeentelijk zaaknummer ${verzoek.id} in behandeling.`;
    notification.datePublished = verzoek.datumInBehandeling;
  }

  if (extraInfoActive) {
    notification.title = 'AVG verzoek meer informatie nodig';
    notification.description = `Wij hebben meer informatie nodig om uw AVG verzoek met gemeentelijk zaaknummer ${verzoek.id} in behandeling te nemen. U krijgt een brief of e-mail waarin staat welke informatie wij nodig hebben.`;
    notification.datePublished = verzoek.opschortenGestartOp;
  }

  if (isDone) {
    notification.title = 'AVG verzoek afgehandeld';
    notification.description = `Uw AVG verzoek met gemeentelijk zaaknummer ${verzoek.id} is afgehandeld. U ontvangt of u heeft hierover bericht gekregen per e-mail of per brief.`;
    notification.datePublished = verzoek.datumAfhandeling;
  }

  return notification;
}
