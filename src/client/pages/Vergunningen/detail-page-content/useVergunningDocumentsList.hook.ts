import useSWR from 'swr';

import { FIFTEEN_MINUTES_MS } from '../../../../universal/config/app';
import { ApiResponse } from '../../../../universal/helpers/api';
import { GenericDocument } from '../../../../universal/types/App.types';

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
