import { GenericDocument } from '../../../../../universal/types/App.types';
import { useBffApi } from '../../../../hooks/api/useDataApi-v2';

export function useVergunningDocumentList(url?: string) {
  const api = useBffApi<GenericDocument[]>(url);

  const documents = api.data?.content ?? [];
  return { documents, isLoading: api.isLoading, isError: api.isError };
}
