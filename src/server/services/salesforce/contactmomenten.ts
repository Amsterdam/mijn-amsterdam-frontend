import type {
  ContactmomentResponseSource,
  ContactmomentFrontend as ContactmomentFrontend,
  AppointmentResponseSource,
  AppointmentFrontend,
  KlantcontactResponseData,
} from './contactmomenten.types.ts';
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

async function requestContactmomentenData<T>(
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

async function fetchAppointments(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<AppointmentFrontend[]>> {
  const requestConfig: DataRequestConfig = {
    postponeFetch: !isEnabled('KLANT_CONTACT.appointments'),
    formatUrl({ url }) {
      return `${url}/services/apexrest/klantinteracties/v1.0/appointments`;
    },
    transformResponse: (
      data: AppointmentResponseSource
    ): AppointmentFrontend[] => {
      const results = data.results.map((result) => {
        const [appointmentDate, startTime] = result.startDate.split(' ');
        const [, endTime] = result.endDate.split(' ');
        const HOUR_MINUTE_FORMAT_END = 5;
        return {
          appointmentDate,
          appointmentDateFormatted: defaultDateFormat(appointmentDate),
          startTime: startTime.slice(0, HOUR_MINUTE_FORMAT_END),
          endTime: endTime.slice(0, HOUR_MINUTE_FORMAT_END),
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
  return requestContactmomentenData(authProfileAndToken, requestConfig);
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
  return requestContactmomentenData<ContactmomentFrontend[]>(
    authProfileAndToken,
    requestConfig
  );
}

export async function fetchKlantcontact(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiSuccessResponse<KlantcontactResponseData>> {
  const [appointmentsResponse, klantcontactenResponse] =
    await Promise.allSettled([
      fetchAppointments(authProfileAndToken),
      fetchContactmomenten(authProfileAndToken),
    ]);

  const appointmentsSettled = getSettledResult(appointmentsResponse);
  const contactmomentenSettled = getSettledResult(klantcontactenResponse);

  const [appointments, contactmomenten] =
    transferMissedAppointmentsToContactmomenten(
      appointmentsSettled.content ?? [],
      contactmomentenSettled.content ?? []
    );

  return apiSuccessResult(
    {
      appointments,
      contactmomenten,
    },
    getFailedDependencies({
      appointments: appointmentsSettled,
      contactmomenten: contactmomentenSettled,
    })
  );
}

/** Missed appointments need to be tranferred because the other types need an interaction (contactmoment) -
 * and are automaticaly tranferred. We want these there as well so we put them there.
 */
function transferMissedAppointmentsToContactmomenten(
  appointments: AppointmentFrontend[],
  contactmomenten: ContactmomentFrontend[]
): [AppointmentFrontend[], ContactmomentFrontend[]] {
  const missedAppointments = appointments
    .filter((a) => a.status === 'No show')
    .map((a) => {
      const klantcontactmoment: ContactmomentFrontend = {
        referenceNumber: a.caseReference,
        contacttype: 'Stadsloket',
        subject: 'Gemiste afspraak',
        datePublishedFormatted: a.appointmentDateFormatted,
        datePublished: a.appointmentDate,
      };
      return klantcontactmoment;
    });
  const appointmentsWithoutMissedAppointments = appointments.filter(
    (a) => a.status !== 'No show'
  );
  return [
    appointmentsWithoutMissedAppointments,
    [...contactmomenten, ...missedAppointments],
  ];
}
