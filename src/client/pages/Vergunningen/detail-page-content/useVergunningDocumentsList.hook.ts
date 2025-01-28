import useSWR from 'swr';

import { ApiResponse } from '../../../../universal/helpers/api';
import { GenericDocument } from '../../../../universal/types/App.types';

const ONE_MINUTE_MS = 60000;
// eslint-disable-next-line no-magic-numbers
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;

export function useVergunningDocumentList(
  url?: string,
  dedupingInterval: number = FIFTEEN_MINUTES_MS
) {
  const { data: documentsResponse } = useSWR<ApiResponse<GenericDocument[]>>(
    url,
    (url: string) =>
      fetch(url, { credentials: 'include' }).then((response) =>
        response.json()
      ),

    { dedupingInterval }
  );
  const vergunningDocuments = documentsResponse?.content ?? [];

  return vergunningDocuments;
}
