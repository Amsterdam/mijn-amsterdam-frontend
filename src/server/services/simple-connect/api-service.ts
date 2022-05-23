import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';

export async function fetchService<T>(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  apiConfig: DataRequestConfig = {}
) {
  const response = await requestData<T>(
    apiConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}
