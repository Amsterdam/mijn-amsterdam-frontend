import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Lood365Response,
  LoodMetingRequestsSource,
  LoodMetingen,
} from './types';

function getDataForLood365(authProfileAndToken: AuthProfileAndToken) {
  if (authProfileAndToken.profile.authMethod === 'digid') {
    return {
      bsn: authProfileAndToken.profile.id ?? '',
    };
  }

  if (authProfileAndToken.profile.authMethod === 'eherkenning') {
    return {
      kvk: authProfileAndToken.profile.id ?? '',
    };
  }
}

function transformLood365Response(response: Lood365Response): LoodMetingen {
  if (!response.responsedata) {
    return { metingen: [] }; //Fout
  }

  try {
    const sourceData: LoodMetingRequestsSource = JSON.parse(
      response.responsedata
    );

    // Transform to something more usefull.
  } catch (e) {
    console.error(e);
    // Log to sentry?
  }

  return { metingen: [] };
}

export async function fetchLoodmetingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const data = getDataForLood365(authProfileAndToken);

  return requestData<Lood365Response>(
    getApiConfig('LOOD_365', {
      transformResponse: transformLood365Response,
      data,
    }),
    requestID
  );
}
