import { BFFApiUrls } from '../../config/api';
import { useBffApi, sendFormPostRequest } from '../../hooks/api/useBffApi';

export function useSubmitUserFeedback() {
  return useBffApi<{ success: boolean }>('user-feedback', {
    fetchImmediately: false,
    url: BFFApiUrls.USER_FEEDBACK_SUBMIT,
    sendRequest: sendFormPostRequest,
  });
}
