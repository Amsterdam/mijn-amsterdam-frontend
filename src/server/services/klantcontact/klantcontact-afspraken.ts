import { fetchSalesforceApi } from './klantcontact-salesforce.ts';
import type {
  AfspraakFrontend,
  AfspraakResponseSource as AfsprakenResponseSource,
} from './klantcontact.types.ts';
import { themaConfig } from '../../../client/pages/Thema/KlantContact/KlantContact-thema-config.ts';
import type { ApiResponse } from '../../../universal/helpers/api.ts';
import {
  dateFormat,
  defaultDateFormat,
  defaultDateFormatWithDayName,
} from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { isEnabled } from '../../config/azure-appconfiguration.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { createICSDataUri } from '../../helpers/ics.ts';
import { createSessionBasedCacheKey } from '../../helpers/source-api-helpers.ts';

export async function fetchAfspraken(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<AfspraakFrontend[]>> {
  const requestConfig: DataRequestConfig = {
    postponeFetch: !isEnabled('KLANT_CONTACT.afspraken'),
    formatUrl({ url }) {
      return `${url}/services/apexrest/klantinteracties/v1.0/appointments`;
    },
    transformResponse: transformAfsprakenResponse,
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid,
      'salesforce-contactmomenten-appointments'
    ),
  };
  return fetchSalesforceApi(authProfileAndToken, requestConfig);
}

function transformAfsprakenResponse(
  data: AfsprakenResponseSource
): AfspraakFrontend[] {
  const results = data.results.map((result) => {
    const dateStart = new Date(result.startDate);
    const dateEnd = new Date(result.endDate);

    const startTime_ = dateFormat(dateStart, 'HH:mm');
    const endTime_ = dateFormat(dateEnd, 'HH:mm');

    const dateStartISO = dateStart.toISOString();
    const dateEndISO = dateEnd.toISOString();

    const icsLink = createICSDataUri({
      start: dateStartISO,
      end: dateEndISO,
      uid: `afspraak-stadsloket-${result.caseReference}`,
      summary: `Afspraak voor ${result.subject}`,
      description: `Referentienummer: ${result.caseReference}`,
      location: `Stadsloket ${result.location.name}, ${result.location.street ?? 'onbekend'}, ${result.location.postalCode} ${result.location.city}, Nederland`,
    });

    return {
      dateStart: dateStartISO,
      dateStartFormatted: defaultDateFormat(dateStart),
      dateEnd: dateEndISO,
      dateEndFormatted: defaultDateFormat(dateEnd),
      displayDateTime: `${defaultDateFormatWithDayName(dateStart)} van ${startTime_} tot ${endTime_} uur`,
      subject: result.subject,
      status: result.status,
      qrCode: result.qrCode,
      location: result.location,
      caseReference: result.caseReference,
      cancellationLink: result.cancellationLink,
      link: {
        to: themaConfig.route.path,
        title: 'Bekijk afspraak',
      },
      icsLink: {
        to: icsLink,
        title: 'Voeg toe aan uw privé-agenda',
        download: `afspraak-${result.caseReference}.ics`,
      },
    };
  });
  return results;
}

export const forTesting = {
  transformAfsprakenResponse,
};
