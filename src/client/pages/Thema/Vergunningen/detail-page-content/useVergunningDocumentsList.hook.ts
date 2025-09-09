import { useEffect } from 'react';

import { GenericDocument } from '../../../../../universal/types/App.types';
import { createApiHook } from '../../../../hooks/api/useDataApi-v2';

const useVergunningenDocumentsApi = createApiHook<GenericDocument[]>();

export function useVergunningDocumentList(url?: string) {
  const api = useVergunningenDocumentsApi();

  useEffect(() => {
    if (api.isPristine && url) {
      api.fetch(url);
    }
  }, [api.fetch, api.isPristine, url]);

  const documents = api.data?.content ?? [];
  return { documents, isLoading: api.isLoading, isError: api.isError };
}
