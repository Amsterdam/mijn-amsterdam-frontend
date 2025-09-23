import { useEffect } from 'react';

import { GenericDocument } from '../../../../../universal/types/App.types';
import { useBffApi } from '../../../../hooks/api/useDataApi-v2';

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
