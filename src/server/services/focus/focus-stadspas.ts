import { fetchFOCUSCombined } from './focus-combined';

export interface FocusStadspasTransaction {
  id: string;
  title: string;
  amount: number;
  date: string;
}

export async function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}
