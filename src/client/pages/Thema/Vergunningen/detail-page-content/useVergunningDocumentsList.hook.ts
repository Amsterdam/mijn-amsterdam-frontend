import useSWR from 'swr';

import { FIFTEEN_MINUTES_MS } from '../../../../../universal/config/app';
import { ApiResponse } from '../../../../../universal/helpers/api';
import { GenericDocument } from '../../../../../universal/types/App.types';

async function fetchDocuments(url: string) {
  const res = await fetch(url, { credentials: 'include' });

  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }

  return res.json();
}

export function useVergunningDocumentList(
  url?: string,
  dedupingInterval: number = FIFTEEN_MINUTES_MS
) {
  const {
    data: documentsResponse,
    isLoading,
    error,
  } = useSWR<ApiResponse<GenericDocument[]>>(url, fetchDocuments, {
    dedupingInterval,
  });
  const documents = documentsResponse?.content ?? [];
  return { documents, isLoading, isError: !!error };
}
