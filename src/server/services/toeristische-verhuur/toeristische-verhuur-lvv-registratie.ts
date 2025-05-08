import {
  LVVRegistratie,
  LVVRegistratieSource,
  ToeristischeVerhuurRegistratieNumberSource,
} from './toeristische-verhuur-config-and-types';
import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { getFullAddress } from '../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { isAmsterdamAddress } from '../buurt/helpers';

export async function fetchRegistraties(
  authProfileAndToken: AuthProfileAndToken
) {
  const registrationNumbersResponse = await requestData<string[]>(
    getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
      formatUrl({ url }) {
        return `${url}/bsn`;
      },
      method: 'POST',
      data: JSON.stringify(authProfileAndToken.profile.id),
      transformResponse: (response) => {
        if (!Array.isArray(response)) {
          return [];
        }
        return response.map((r: ToeristischeVerhuurRegistratieNumberSource) =>
          r.registrationNumber.replaceAll(' ', '')
        );
      },
    })
  );

  if (registrationNumbersResponse.status !== 'OK') {
    return apiDependencyError({
      registrationNumbers: registrationNumbersResponse,
    });
  }

  const registrationDetailResponses = await Promise.all(
    registrationNumbersResponse.content?.map((registratienummer) => {
      return requestData<LVVRegistratieSource>(
        getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
          formatUrl({ url }) {
            return `${url}/${registratienummer}`;
          },
          method: 'get',
        })
      );
    }) ?? []
  );

  if (!registrationDetailResponses.every((r) => r.status === 'OK')) {
    return apiErrorResult('Could not retrieve all registration details', null);
  }

  const registrations: LVVRegistratie[] = registrationDetailResponses
    .map((response) => response.content)
    .filter(
      (registrationDetails) =>
        registrationDetails !== null &&
        isAmsterdamAddress(registrationDetails?.rentalHouse.city)
    )
    .map(
      ({
        rentalHouse: {
          city,
          street,
          houseNumber,
          houseLetter,
          houseNumberExtension,
          postalCode,
        },
        registrationNumber,
        agreementDate,
      }) => {
        const rUpdated: LVVRegistratie = {
          address: getFullAddress({
            straatnaam: street,
            huisnummer: houseNumber,
            huisnummertoevoeging: houseNumberExtension,
            huisletter: houseLetter,
            postcode: postalCode,
            woonplaatsNaam: city,
          }),
          registrationNumber,
          agreementDate,
          agreementDateFormatted: agreementDate
            ? defaultDateFormat(agreementDate)
            : null,
        };
        return rUpdated;
      }
    );

  return apiSuccessResult(registrations);
}
