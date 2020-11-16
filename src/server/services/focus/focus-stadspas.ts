import { fetchFOCUSCombined } from './focus-combined';
import { apiSuccesResult } from '../../../universal/helpers/api';

export interface FocusStadspasTransaction {
  id: string;
  title: string;
  amount: string;
  date: string;
}

export async function fetchStadspasSaldo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return apiSuccesResult(response.content.stadspassaldo || null);
  }

  return response;
}
