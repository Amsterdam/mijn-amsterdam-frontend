import { isAfter } from 'date-fns';

import { fetchAfspraken } from './klantcontact-afspraken.ts';
import { fetchCommunicatievoorkeuren } from './klantcontact-communicatievoorkeuren.ts';
import { fetchContactmomenten } from './klantcontact-contactmomenten.ts';
import type {
  ContactmomentFrontend as ContactmomentFrontend,
  AfspraakFrontend as AfspraakFrontend,
  KlantcontactResponseData,
} from './klantcontact.types.ts';
import {
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiSuccessResponse,
} from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

export async function fetchKlantcontact(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiSuccessResponse<KlantcontactResponseData>> {
  const [
    afsprakenResponse,
    klantcontactenResponse,
    communicatievoorkeurenResponse,
  ] = await Promise.allSettled([
    fetchAfspraken(authProfileAndToken),
    fetchContactmomenten(authProfileAndToken),
    fetchCommunicatievoorkeuren(authProfileAndToken),
  ]);

  const afsprakenSettled = getSettledResult(afsprakenResponse);
  const contactmomentenSettled = getSettledResult(klantcontactenResponse);
  const communicatievoorkeurenSettled = getSettledResult(
    communicatievoorkeurenResponse
  );

  const afspraken = (afsprakenSettled.content ?? []).toSorted(
    dateSort('dateStart', 'asc')
  );
  const contactmomenten = addMissedAfsprakenToContactmomenten(
    afspraken,
    contactmomentenSettled.content ?? []
  ).toSorted(dateSort('datePublished', 'desc'));

  return apiSuccessResult(
    {
      afspraken: afspraken.filter((a) => isUpcomingAndActive(a)),
      contactmomenten,
      communicatievoorkeuren: communicatievoorkeurenSettled.content,
    },
    getFailedDependencies({
      afspraken: afsprakenSettled,
      contactmomenten: contactmomentenSettled,
      communicatievoorkeuren: communicatievoorkeurenSettled,
    })
  );
}

function isUpcomingAndActive(afspraak: AfspraakFrontend): boolean {
  return (
    !isMissed(afspraak) &&
    afspraak.status !== 'Cancelled' &&
    isAfter(afspraak.dateEnd, new Date())
  );
}

/** Missed appointments need to be added because the other types need an interaction (contactmoment) -
 * and are already present in that dataset. We want these there as well so we put them there.
 */
function addMissedAfsprakenToContactmomenten(
  afspraken: AfspraakFrontend[],
  contactmomenten: ContactmomentFrontend[]
): ContactmomentFrontend[] {
  const missedAfspraken = afspraken.filter(isMissed).map((a) => {
    const klantcontactmoment: ContactmomentFrontend = {
      referenceNumber: a.caseReference,
      kanaal: 'Stadsloket',
      subject: 'Gemiste afspraak',
      datePublishedFormatted: a.dateStartFormatted,
      datePublished: a.dateStart,
    };
    return klantcontactmoment;
  });
  return [...contactmomenten, ...missedAfspraken];
}

function isMissed(afspraak: AfspraakFrontend): boolean {
  const noshowStatus: AfspraakFrontend['status'][] = [
    'NoShowCounter',
    'No show',
  ];
  return noshowStatus.includes(afspraak.status);
}

export const forTesting = {
  addMissedAfsprakenToContactmomenten,
  isMissed,
  isUpcomingAndActive,
};
