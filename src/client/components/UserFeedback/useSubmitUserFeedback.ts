import { BFFApiUrls } from '../../config/api';
import { useBffApi, sendFormPostRequest } from '../../hooks/api/useBffApi';

export function useSubmitUserFeedback(version?: number) {
  const url = new URL(BFFApiUrls.USER_FEEDBACK_SUBMIT);
  if (version) {
    url.searchParams.append('version', version.toString());
  }
  return useBffApi<{ success: boolean }>('user-feedback', {
    fetchImmediately: false,
    url: url.toString(),
    sendRequest: sendFormPostRequest,
  });
}
