import { useParams } from 'react-router';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook.ts';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';

export function useVergunningenDetailData<T extends VergunningFrontend>(
  vergunningen: T[]
) {
  const { id } = useParams<{ id: VergunningFrontend['id'] }>();
  const vergunning = vergunningen.find((vergunning) => vergunning.id === id);
  const fetchDocumentsUrl = vergunning?.fetchDocumentsUrl;
  const { documents, isError, isLoading } =
    useVergunningDocumentList(fetchDocumentsUrl);

  if (vergunning?.fetchSourceRaw) {
    // Utility url
    // eslint-disable-next-line no-console
    console.info(`Decos data: ${vergunning.fetchSourceRaw}`);
  }

  return {
    vergunning,
    isErrorDocuments: isError,
    isLoadingDocuments: isLoading,
    documents,
    title: vergunning?.title,
  };
}
