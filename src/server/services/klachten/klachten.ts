import FormData from 'form-data';
import { generatePath } from 'react-router';
import UID from 'uid-safe';

import { ThemaIDs } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types/App.types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { smileDateParser } from '../smile/smile-helpers';
import { AppRoutes } from './../../../universal/config/routes';
import { AuthProfileAndToken } from './../../auth/auth-types';
import { Klacht, KlachtenResponse, SmileKlachtenReponse } from './types';
import { defaultDateFormat } from '../../../universal/helpers/date';

const DEFAULT_PAGE_SIZE = 250;

function getDataForKlachten(bsn: string, page: number) {
  const data = new FormData();
  data.append('username', process.env.BFF_SMILE_USERNAME);
  data.append('password', process.env.BFF_SMILE_PASSWORD);
  data.append('function', 'readKlacht');
  const columns = [
    'klacht_id',
    'klacht_klachtonderwerp',
    'klacht_datumontvangstklacht',
    'klacht_locatieadres',
    'klacht_omschrijving',
    'klacht_gewensteoplossing',
    'klacht_inbehandeling',
  ].join(', ');

  data.append('columns', columns);

  data.append(
    'filters',
    `klacht.ff03='${bsn}' AND klacht.datumontvangstklacht > Session.NOW[-1,year]`
  );
  data.append('pagesize', DEFAULT_PAGE_SIZE);
  data.append('page', page);
  data.append('orderbys', 'klacht_id desc');

  return data;
}

// Temporary translation table see MIJN-4781
function klachtSubjectParser(subject: string | null): string {
  if (!subject) {
    return '';
  }

  const translationTable: { [key: string]: string | undefined } = {
    'Test voor decentrale toewijzing': 'Overlast, onderhoud en afval',
    '14 020': 'Contact met een medewerker',
    '14020': 'Contact met een medewerker',
    GGD: 'GGD en Veiligthuis',
    Belastingen: 'Belastingen en heffingen',
  };

  return translationTable[subject] ?? subject;
}

export function transformKlachtenResponse(
  data: SmileKlachtenReponse
): KlachtenResponse {
  if (!Array.isArray(data?.List)) {
    return {
      aantal: 0,
      klachten: [],
    };
  }

  const klachten = data.List.map((klachtSource) => {
    const BYTE_LENGTH = 18;
    const id = klachtSource.klacht_id.value || UID.sync(BYTE_LENGTH);
    const ontvangstDatum = smileDateParser(
      klachtSource?.klacht_datumontvangstklacht.value || ''
    );

    const klacht: Klacht = {
      id,
      title: id,
      inbehandelingSinds: smileDateParser(
        klachtSource?.klacht_inbehandeling.value || ''
      ),
      ontvangstDatum,
      ontvangstDatumFormatted: ontvangstDatum
        ? defaultDateFormat(ontvangstDatum)
        : null,
      omschrijving: klachtSource?.klacht_omschrijving.value || '',
      gewensteOplossing: klachtSource?.klacht_gewensteoplossing.value,
      onderwerp: klachtSubjectParser(
        klachtSource?.klacht_klachtonderwerp.value
      ),
      locatie: klachtSource?.klacht_locatieadres.value,
      link: {
        to: generatePath(AppRoutes['KLACHTEN/KLACHT'], {
          id,
        }),
        title: `Klacht ${id}`,
      },
      displayStatus: 'Ontvangen',
      steps: [],
    };

    return klacht;
  });

  return {
    aantal: data.rowcount,
    klachten,
  };
}

function createKlachtNotification(klacht: Klacht): MyNotification {
  const notification: MyNotification = {
    themaID: ThemaIDs.KLACHTEN,
    id: `klacht-${klacht.id}-notification`,
    title: 'Klacht ontvangen',
    description: 'Uw klacht is ontvangen.',
    datePublished: klacht.ontvangstDatum,
    link: {
      to: klacht.link.to,
      title: 'Bekijk details',
    },
  };

  return notification;
}

async function fetchKlachten(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  page: number = 1
) {
  const data = getDataForKlachten(authProfileAndToken.profile.id!, page);

  return requestData<KlachtenResponse>(
    getApiConfig('ENABLEU_2_SMILE', {
      transformResponse: transformKlachtenResponse,
      data,
      headers: data.getHeaders(),
      cacheKey: `klachten-${requestID}`,
    }),
    requestID
  );
}

export async function fetchAllKlachten(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  let page = 0;

  const PAGES_TO_FETCH = 5;
  const MAX_KLACHTEN_COUNT = PAGES_TO_FETCH * DEFAULT_PAGE_SIZE;
  const result: KlachtenResponse = {
    aantal: 0,
    klachten: [],
  };

  const initalResponse = await fetchKlachten(
    requestID,
    authProfileAndToken,
    page
  );

  if (initalResponse.status === 'OK') {
    result.aantal = initalResponse.content.aantal;
    result.klachten = initalResponse.content.klachten;

    while (
      result.klachten.length < result.aantal &&
      result.klachten.length < MAX_KLACHTEN_COUNT
    ) {
      const response = await fetchKlachten(
        requestID,
        authProfileAndToken,
        (page += 1)
      );

      if (response.status === 'OK') {
        result.klachten = result.klachten.concat(response.content.klachten);
      } else {
        return response;
      }
    }

    return apiSuccessResult<KlachtenResponse>(result);
  }

  return initalResponse;
}

export async function fetchKlachtenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const KLACHTEN = await fetchAllKlachten(requestID, authProfileAndToken);

  if (KLACHTEN.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(
      KLACHTEN.content.klachten
    )
      ? KLACHTEN.content.klachten.map((klacht) =>
          createKlachtNotification(klacht)
        )
      : [];

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ KLACHTEN });
}
