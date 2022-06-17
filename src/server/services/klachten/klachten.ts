import { generatePath } from 'react-router-dom';
import UID from 'uid-safe';
import { AppRoutes } from './../../../universal/config/routes';
import FormData from 'form-data';
import { AuthProfileAndToken } from './../../helpers/app';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { Klacht, SmileSourceResponse } from './types';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { Chapters } from '../../../universal/config';

function getDataForKlachten(bsn: string) {
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

export function transformKlachtenResponse(data: SmileSourceResponse): Klacht[] {
  if (!Array.isArray(data?.List)) {
    return [];
  }

  return data.List.map((klacht) => {
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
      onderwerp: klacht?.klacht_klachtonderwerp.value,
      locatie: klacht?.klacht_locatieadres.value,
      link: {
        to: generatePath(AppRoutes['KLACHTEN/KLACHT'], {
          id,
        }),
        title: `Klacht ${id}`,
      },
    };
  });
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

export async function fetchKlachten(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const data = getDataForKlachten(authProfileAndToken.profile.id!);

  return requestData<Klacht[]>(
    getApiConfig('KLACHTEN', {
      transformResponse: transformKlachtenResponse,
      data,
      headers: data.getHeaders(),
    }),
    requestID
  );
}

export async function fetchKlachtenGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const KLACHTEN = await fetchKlachten(requestID, authProfileAndToken);

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
