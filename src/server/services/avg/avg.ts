import FormData from 'form-data';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters, FeatureToggle } from '../../../universal/config';
import {
  ApiSuccessResponse,
  apiDependencyError,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { smileDateParser } from '../smile/smile-helpers';
import {
  AVGRequest,
  AVGResponse,
  AvgThemesResponse,
  SmileAvgResponse,
  SmileAvgThemesResponse,
} from './types';

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
    'avgverzoek_typeafhandeling_resultaat',
    'avgverzoek_datumbinnenkomst',
    'avgverzoek_opschortengestartop',
    'avgverzoek_datuminbehandeling',
    'avgverzoek_werkelijkeeinddatum',
    'avgverzoek_omschrijvingvanonderwerp',
    'avgverzoek_statusavgverzoek_alias',
    'avgverzoek_themas',
  ].join(', ');

  data.append('columns', columns);
  data.append(
    'filters',
    `avgverzoek.bsn='${bsn}' AND avgverzoek.datumbinnenkomst > Session.NOW[-1,year]`
  );

  data.append('pagesize', DEFAULT_PAGE_SIZE);

  return data;
}

function getDataForAvgThemas(avgId: string) {
  const data = new FormData();

  data.append('username', process.env.BFF_SMILE_USERNAME);
  data.append('password', process.env.BFF_SMILE_PASSWORD);
  data.append('function', 'readthemaperavgverzoek');

  const columns = [
    'themaperavgverzoek_avgthema_omschrijving',
    'themaperavgverzoek_avgverzoek_id',
  ].join(', ');

  data.append('columns', columns);
  data.append('filters', `themaperavgverzoek.avgverzoek.id IN ('${avgId}')`);

  return data;
}

export async function enrichAvgResponse(
  avgResponse: ApiSuccessResponse<AVGResponse>
) {
  const rs = [];

  for (const avgRequest of avgResponse.content.verzoeken) {
    const themePromise = fetchAVGRequestThemes(avgRequest.id);

    rs.push(
      Promise.all([Promise.resolve(avgRequest), themePromise]).then((res) =>
        apiSuccessResult(res)
      )
    );
  }

  const results = await Promise.allSettled(rs);
  const enrichedAvgRequests: AVGRequest[] = [];

  for (const result of results) {
    const settledResult = getSettledResult(result);

    if (settledResult.status === 'OK') {
      const [avgRequest, { content: themes }] = settledResult.content;

      const enrichedAvgRequest = {
        ...avgRequest,
        themas: themes?.verzoeken.map((theme) => theme.themaOmschrijving),
      };

      enrichedAvgRequests.push(enrichedAvgRequest);
    }
  }

  return apiSuccessResult({
    verzoeken: enrichedAvgRequests,
  });
}

export function transformAVGResponse(data: SmileAvgResponse): AVGResponse {
  if (!data.List || data.rowcount === 0) {
    return {
      aantal: 0,
      verzoeken: [],
    };
  }

  const response = {
    verzoeken: data.List.map((verzoek) => {
      const id = verzoek['avgverzoek_id']?.value || '';

      const request: AVGRequest = {
        id,
        status: verzoek['avgverzoek_statusavgverzoek_alias'].value || '',
        registratieDatum: smileDateParser(
          verzoek['avgverzoek_datuminbehandeling']?.value || ''
        ),
        type: verzoek['avgverzoek_typeverzoek'].value || '',
        onderwerp: verzoek['avgverzoek_themas']?.value || '',
        toelichting:
          verzoek['avgverzoek_omschrijvingvanonderwerp']?.value || '',
        resultaat: verzoek['avgverzoek_typeafhandeling_resultaat']?.value || '',
        ontvangstDatum: smileDateParser(
          verzoek['avgverzoek_datumbinnenkomst'].value || ''
        ),
        opschortenGestartOp: smileDateParser(
          verzoek['avgverzoek_opschortengestartop']?.value || ''
        ),
        datumInBehandeling: smileDateParser(
          verzoek['avgverzoek_datuminbehandeling']?.value || ''
        ),
        datumAfhandeling: smileDateParser(
          verzoek['avgverzoek_werkelijkeeinddatum']?.value || ''
        ),
        link: {
          to: generatePath(AppRoutes['AVG/DETAIL'], {
            id,
          }),
          title: `AVG verzoek ${id}`,
        },
      };

      return request;
    }),
    aantal: data.rowcount,
  };

  return response;
}

export async function fetchAVG(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const data = getDataForAVG(authProfileAndToken.profile.id!);
  const response = await requestData<AVGResponse>(
    getApiConfig('ENABLEU_2_SMILE', {
      transformResponse: transformAVGResponse,
      data,
      headers: data.getHeaders(),
      cacheKey: `avg-${requestID}`,
      postponeFetch: !FeatureToggle.avgActive,
    }),
    requestID
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

export async function fetchAVGRequestThemes(avgId: string) {
  const data = getDataForAvgThemas(avgId);

  const res = await requestData<AvgThemesResponse>(
    getApiConfig('ENABLEU_2_SMILE', {
      transformResponse: transformAVGThemeResponse,
      data,
      headers: data.getHeaders(),
      cacheKey: `avg-themes-${avgId}`,
      postponeFetch: !FeatureToggle.avgActive,
    }),
    avgId
  );

  return res;
}

// fetchNotificaties
export async function fetchAVGNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const AVG = await fetchAVG(requestID, authProfileAndToken);

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

function createAVGNotification(verzoek: AVGRequest) {
  const isDone = !!verzoek.datumAfhandeling;
  const extraInfoActive = !!verzoek.opschortenGestartOp;
  const inProgressActive = !!verzoek.datumInBehandeling;

  const notification: MyNotification = {
    chapter: Chapters.AVG,
    id: `avg-${verzoek.id}-notification`,
    title: 'AVG verzoek ontvangen',
    description: 'Uw AVG verzoek is ontvangen.',
    datePublished: verzoek.ontvangstDatum,
    link: {
      to: verzoek.link.to,
      title: 'Bekijk details',
    },
  };

  if (extraInfoActive) {
    notification.title = 'AVG verzoek meer informatie nodig';
    notification.description =
      'Wij hebben meer informatie en tijd nodig om uw AVG verzoek te behandelen.';
    notification.datePublished = verzoek.opschortenGestartOp;
  }

  if (inProgressActive) {
    notification.title = 'AVG verzoek in behandeling';
    notification.description = 'Uw AVG verzoek is in behandeling genomen.';
    notification.datePublished = verzoek.datumInBehandeling;
  }

  if (isDone) {
    notification.title = 'AVG verzoek afgehandeld';
    notification.description = 'Uw AVG verzoek is afgehandeld.';
    notification.datePublished = verzoek.datumAfhandeling;
  }

  return notification;
}
