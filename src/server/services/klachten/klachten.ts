import { generatePath } from 'react-router-dom';
import UID from 'uid-safe';
import { AppRoutes } from './../../../universal/config/routes';
import FormData from 'form-data';
import { AuthProfileAndToken } from './../../helpers/app';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { Klacht, KlachtenResponse, SmileSourceResponse } from './types';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { Chapters } from '../../../universal/config';

const DEFAULT_PAGE_SIZE = 20;

function getDataForKlachten(bsn: string, page: number) {
  const data = new FormData();
  data.append('username', process.env.BFF_SMILE_USERNAME);
  data.append('password', process.env.BFF_SMILE_PASSWORD);
  data.append('function', 'readKlacht');
  data.append(
    'columns',
    'klacht_id, klacht_klachtonderwerp, klacht_datumontvangstklacht,klacht_locatieadres, klacht_omschrijving,klacht_gewensteoplossing,klacht_inbehandeling'
  );
  data.append(
    'filters',
    "klacht.ff03='" +
      bsn +
      "'  AND klacht.datumontvangstklacht > Session.NOW[-1,year]"
  );
  data.append('pagesize', DEFAULT_PAGE_SIZE);
  data.append('page', page);
  data.append('orderbys', 'klacht_id desc');

  return data;
}

/**
 * The smile API provides dates in different formats.
 * This function aims to normalize them into a Date object.
 * @param smileDate
 * @returns
 */
function smileDateParser(smileDate: string): string {
  const datePart = smileDate.split(' ')[0];
  const dateInParts = datePart.split('-');

  return new Date(
    `${dateInParts[2]}-${dateInParts[1]}-${dateInParts[0]}`
  ).toISOString();
}

// Temporary translation table see MIJN-4781
function smileSubjectParser(subject: string | null): string {
  if (!subject) {
    return '';
  }

  const translationTable: { [key: string]: string | undefined } = {
    'Test voor decentrale toewijzing': 'Overlast, onderhoud en afval',
    '14 020': 'Contact met een medewerker',
    GGD: 'GGD en Veiligthuis',
    Belastingen: 'Belastingen en heffingen',
  };

  return translationTable[subject] ?? subject;
}

export function transformKlachtenResponse(
  data: SmileSourceResponse
): KlachtenResponse {
  if (!Array.isArray(data?.List)) {
    return {
      aantal: 0,
      klachten: [],
    };
  }

  const klachten = data.List.map((klacht) => {
    const id = klacht.klacht_id.value || UID.sync(18);

    return {
      id,
      inbehandelingSinds: smileDateParser(
        klacht?.klacht_inbehandeling.value || ''
      ),
      ontvangstDatum: smileDateParser(
        klacht?.klacht_datumontvangstklacht.value || ''
      ),
      omschrijving: klacht?.klacht_omschrijving.value || '',
      gewensteOplossing: klacht?.klacht_gewensteoplossing.value,
      onderwerp: smileSubjectParser(klacht?.klacht_klachtonderwerp.value),
      locatie: klacht?.klacht_locatieadres.value,
      link: {
        to: generatePath(AppRoutes['KLACHTEN/KLACHT'], {
          id,
        }),
        title: `Klacht ${id}`,
      },
    };
  });

  return {
    aantal: data.rowcount,
    klachten,
  };
}

function createKlachtNotification(klacht: Klacht): MyNotification {
  const notification: MyNotification = {
    chapter: Chapters.KLACHTEN,
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  page: number = 1
) {
  const data = getDataForKlachten(authProfileAndToken.profile.id!, page);

  return requestData<KlachtenResponse>(
    getApiConfig('KLACHTEN', {
      transformResponse: transformKlachtenResponse,
      data,
      headers: data.getHeaders(),
    }),
    requestID
  );
}

export async function fetchAllKlachten(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  let page = 1;
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

    while (result.klachten.length < result.aantal && page < 5) {
      const response = await fetchKlachten(
        requestID,
        authProfileAndToken,
        (page += 1)
      );

      if (response.status === 'OK') {
        result.klachten = result.klachten.concat(response.content.klachten);
      } else {
        return apiDependencyError({ response });
      }
    }

    return apiSuccessResult<KlachtenResponse>(result);
  }

  return apiDependencyError({ initalResponse });
}

export async function fetchKlachtenGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const KLACHTEN = await fetchAllKlachten(requestID, authProfileAndToken);

  if (KLACHTEN.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(KLACHTEN.content)
      ? KLACHTEN.content.map((klacht) => createKlachtNotification(klacht))
      : [];

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ KLACHTEN });
}
