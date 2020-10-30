import { apiSuccesResult } from '../../../universal/helpers/api';
import {
  fetchFOCUSCombined,
  FocusCombinedSourceResponse,
} from './focus-combined';

export interface FocusStadspasTransaction {
  id: string;
  title: string;
  amount: string;
  date: string;
}

export function transformFocusStadspasData(
  stadspassaldo: FocusCombinedSourceResponse['stadspassaldo']
) {
  return apiSuccesResult(
    stadspassaldo.map(saldo => {
      return {
        ...saldo,
        urlTransactions: `/api${saldo.urlTransactions}`,
      };
    })
  );
}

export async function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return transformFocusStadspasData(response.content.stadspassaldo);
  }

  return response;
}
