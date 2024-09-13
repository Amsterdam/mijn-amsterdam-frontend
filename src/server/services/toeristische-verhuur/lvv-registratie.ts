import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { requestData } from '../../helpers/source-api-request';
import { isAmsterdamAddress } from '../buurt/helpers';

export interface ToeristischeVerhuurRegistratieNumberSource {
  registrationNumber: string;
}

export interface ToeristischeVerhuurRegistratieHouse {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  street: string | null;
}

export interface ToeristischeVerhuurRegistratieDetailSource {
  rentalHouse: ToeristischeVerhuurRegistratieHouse;
  registrationNumber: string;
  agreementDate: string | null;
}

export interface ToeristischeVerhuurRegistratieDetail {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  registrationNumber: string;
  street: string | null;
  agreementDate: string | null;
}

export interface ToeristischeVerhuurRegistratieDetailsSourceData {
  content: ToeristischeVerhuurRegistratieDetail[];
}

export async function fetchRegistraties(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const url = `${process.env.BFF_LVV_API_URL}/bsn`;
  const registrationNumbersResponse = await requestData<string[]>(
    getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
      url,
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
    }),
    requestID
  );

  if (registrationNumbersResponse.status !== 'OK') {
    return apiDependencyError({
      registrationNumbers: registrationNumbersResponse,
    });
  }

  const registrationDetailResponses = await Promise.all(
    registrationNumbersResponse.content?.map((num) => {
      const url = `${process.env.BFF_LVV_API_URL}/${num}`;
      return requestData<ToeristischeVerhuurRegistratieDetailSource>(
        getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
          method: 'get',
          url,
        }),
        requestID
      );
    }) || []
  );

  if (!registrationDetailResponses.every((r) => r.status === 'OK')) {
    return apiErrorResult('Could not retrieve all registration details', null);
  }

  const registrations: ToeristischeVerhuurRegistratieDetail[] =
    registrationDetailResponses
      .map((response) => response.content)
      .filter(
        (r): r is ToeristischeVerhuurRegistratieDetailSource =>
          r !== null && isAmsterdamAddress(r?.rentalHouse.city)
      )
      .map((r) => {
        const rUpdated: ToeristischeVerhuurRegistratieDetail = {
          ...r.rentalHouse,
          registrationNumber: r.registrationNumber,
          agreementDate: r.agreementDate,
        };
        return rUpdated as ToeristischeVerhuurRegistratieDetail;
      });

  return apiSuccessResult(registrations);
}
