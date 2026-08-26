import type {
  SurveyOverviewFrontend,
  UserFeedbackAdministrationMeta,
  UserFeedbackHandoffConfigResponse,
} from '../../../../../server/services/user-feedback/user-feedback.types.ts';
import { dateSort } from '../../../../../universal/helpers/date.ts';
import {
  sendJSONPostRequest,
  useBffApi,
  useBffApiStateStore,
} from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';

export function useUserFeedbackApi(page?: number) {
  return useBffApi<SurveyOverviewFrontend>(
    `${BFFApiUrls.USER_FEEDBACK}?page=${page ?? 1}`
  );
}

export function useUserFeedbackHandoffConfigApi() {
  return useBffApi<UserFeedbackHandoffConfigResponse>(
    BFFApiUrls.USER_FEEDBACK_HANDOFF_CONFIG
  );
}

export function useJiraTicketApi(
  entryId: SurveyOverviewFrontend['entries'][number]['id']
) {
  const createTicketApi = useBffApi(
    BFFApiUrls.USER_FEEDBACK_CREATE_TICKET(entryId),
    {
      fetchImmediately: false,
      sendRequest: sendJSONPostRequest,
    }
  );

  const deleteTicketApi = useBffApi(
    BFFApiUrls.USER_FEEDBACK_DELETE_TICKET(entryId),
    { init: { method: 'DELETE' }, fetchImmediately: false }
  );

  const handoffDepartmentApi = useBffApi<UserFeedbackAdministrationMeta>(
    BFFApiUrls.USER_FEEDBACK_HANDOFF_DEPARTMENT(entryId),
    {
      fetchImmediately: false,
      sendRequest: sendJSONPostRequest,
    }
  );

  return {
    createApi: createTicketApi,
    deleteApi: deleteTicketApi,
    handoffDepartmentApi,
  };
}

export function useAdministrationStateContent() {
  const apiStateStore = useBffApiStateStore();

  return (entry: SurveyOverviewFrontend['entries'][number]) => {
    const deleteTicketApiState =
      apiStateStore.get<UserFeedbackAdministrationMeta>(
        BFFApiUrls.USER_FEEDBACK_DELETE_TICKET(entry.id)
      );
    const createTicketApiState =
      apiStateStore.get<UserFeedbackAdministrationMeta>(
        BFFApiUrls.USER_FEEDBACK_CREATE_TICKET(entry.id)
      );
    const handoffApiState = apiStateStore.get<UserFeedbackAdministrationMeta>(
      BFFApiUrls.USER_FEEDBACK_HANDOFF_DEPARTMENT(entry.id)
    );

    // Get the last returned administration meta from the API state store, sorted by dateModified in descending order.
    const lastReturnedAdministrationMeta = [
      deleteTicketApiState?.data?.content ?? null,
      createTicketApiState?.data?.content ?? null,
      handoffApiState?.data?.content ?? null,
    ]
      .filter((x) => x !== null)
      .toSorted(dateSort('dateModified', 'desc'))[0];

    const administrationMeta: UserFeedbackAdministrationMeta = {
      ...entry.administrationMeta,
      ...lastReturnedAdministrationMeta,
    };

    return administrationMeta;
  };
}
