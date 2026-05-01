import type {
  ContactmomentResponseSource,
  ContactmomentFrontend as ContactmomentFrontend,
  AfspraakResponseSource as AfsprakenResponseSource,
  AfspraakFrontend as AfspraakFrontend,
  KlantcontactResponseData,
} from './klantcontact.types.ts';
import {
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
  type ApiSuccessResponse,
} from '../../../universal/helpers/api.ts';
import {
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers/date.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { isEnabled } from '../../config/azure-appconfiguration.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { encrypt } from '../../helpers/encrypt-decrypt.ts';
import { getFromEnv } from '../../helpers/env.ts';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

async function fetchContactmomentenData<T>(
  authProfileAndToken: AuthProfileAndToken,
  dataRequestConfigSpecific: DataRequestConfig
) {
  const base64encodedPK = getFromEnv(
    'BFF_CONTACTMOMENTEN_PRIVATE_ENCRYPTION_KEY',
    true
  )!;
  const [, encryptedBSN, iv] = encrypt(
    authProfileAndToken.profile.id,
    Buffer.from(base64encodedPK, 'base64')
  );
  const dataRequestConfigBase = getApiConfig('CONTACTMOMENTEN', {
    ...dataRequestConfigSpecific,
    params: {
      hadBetrokkene__uuid: encryptedBSN.toString('base64'),
      iv: iv.toString('base64'),
      pageSize: 100,
      ...dataRequestConfigSpecific.params,
    },
  });
  return requestData<T>(dataRequestConfigBase);
}

async function fetchAfspraken(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<AfspraakFrontend[]>> {
  const requestConfig: DataRequestConfig = {
    postponeFetch: !isEnabled('KLANT_CONTACT.afspraken'),
    formatUrl({ url }) {
      return `${url}/services/apexrest/klantinteracties/v1.0/appointments`;
    },
    transformResponse: (data: AfsprakenResponseSource): AfspraakFrontend[] => {
      const results = data.results.map((result) => {
        const [startDate, startTime] = result.startDate.split(' ');
        const [endDate, endTime] = result.endDate.split(' ');
        return {
          startDate: `${startDate}T${startTime}Z`,
          endDate: `${endDate}T${endTime}Z`,
          dateFormatted: defaultDateFormat(startDate),
          subject: result.subject,
          status: result.status,
          qrCode: result.qrCode,
          location: result.location,
          caseReference: result.caseReference,
          cancellationLink: result.cancellationLink,
        };
      });
      return results;
    },
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid,
      'salesforce-contactmomenten-appointments'
    ),
  };
  return fetchContactmomentenData(authProfileAndToken, requestConfig);
}

function transformContactmomentenResponse(
  responseData: ContactmomentResponseSource
) {
  if (responseData.results) {
    return responseData.results
      .map((contactMoment) => ({
        referenceNumber: contactMoment.nummer,
        subject: contactMoment.onderwerp,
        contacttype: contactMoment.kanaal,
        datePublishedFormatted: defaultDateFormat(
          contactMoment.plaatsgevondenOp
        ),
        datePublished: contactMoment.plaatsgevondenOp,
      }))
      .sort(dateSort('datePublished', 'desc'));
  }
  return [];
}

async function fetchContactmomenten(authProfileAndToken: AuthProfileAndToken) {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    transformResponse: transformContactmomentenResponse,
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid,
      'salesforce-klantcontact-contactmomenten'
    ),
  };
  return fetchContactmomentenData<ContactmomentFrontend[]>(
    authProfileAndToken,
    requestConfig
  );
}

export async function fetchKlantcontact(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiSuccessResponse<KlantcontactResponseData>> {
  const [afsprakenResponse, klantcontactenResponse] = await Promise.allSettled([
    fetchAfspraken(authProfileAndToken),
    fetchContactmomenten(authProfileAndToken),
  ]);

  const afsprakenSettled = getSettledResult(afsprakenResponse);
  const contactmomentenSettled = getSettledResult(klantcontactenResponse);

  const [afspraken, contactmomenten] = transferMissedAfsprakenToContactmomenten(
    afsprakenSettled.content ?? [],
    contactmomentenSettled.content ?? []
  );

  return apiSuccessResult(
    {
      afspraken,
      contactmomenten,
    },
    getFailedDependencies({
      appointments: afsprakenSettled,
      contactmomenten: contactmomentenSettled,
    })
  );
}

/** Missed appointments need to be tranferred because the other types need an interaction (contactmoment) -
 * and are automaticaly tranferred. We want these there as well so we put them there.
 */
function transferMissedAfsprakenToContactmomenten(
  afspraken: AfspraakFrontend[],
  contactmomenten: ContactmomentFrontend[]
): [AfspraakFrontend[], ContactmomentFrontend[]] {
  const missedAfspraken = afspraken
    .filter((a) => a.status === 'No show')
    .map((a) => {
      const klantcontactmoment: ContactmomentFrontend = {
        referenceNumber: a.caseReference,
        contacttype: 'Stadsloket',
        subject: 'Gemiste afspraak',
        datePublishedFormatted: a.dateFormatted,
        datePublished: a.startDate,
      };
      return klantcontactmoment;
    });
  const afsprakenWithoutMissedAfspraken = afspraken.filter(
    (a) => a.status !== 'No show'
  );
  return [
    afsprakenWithoutMissedAfspraken,
    [...contactmomenten, ...missedAfspraken],
  ];
}
