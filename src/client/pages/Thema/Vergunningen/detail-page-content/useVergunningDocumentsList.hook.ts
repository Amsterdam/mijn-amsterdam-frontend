import { useEffect } from 'react';

import type { GenericDocument } from '../../../../../universal/types/App.types.ts';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';

export function useVergunningDocumentList(url?: string) {
  const { fetch, isPristine, data, isLoading, isError } = useBffApi<
    GenericDocument[]
  >(url, {
    fetchImmediately: false,
  });

  useEffect(() => {
    if (url && isPristine) {
      fetch(url);
    }
  }, [url, isPristine, fetch]);

  const documents = data?.content ?? [];
  return { documents, isLoading, isError };
}
