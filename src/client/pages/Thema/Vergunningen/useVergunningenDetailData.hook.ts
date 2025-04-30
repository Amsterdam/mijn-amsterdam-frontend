import { useParams } from 'react-router';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';

export function useVergunningenDetailData<T extends VergunningFrontend>(
  vergunningen: T[]
) {
  const { id } = useParams<{ id: VergunningFrontend['id'] }>();
  const vergunning = vergunningen.find((vergunning) => vergunning.id === id);
  const fetchDocumentsUrl = vergunning?.fetchDocumentsUrl;
  const { documents, isError, isLoading } =
    useVergunningDocumentList(fetchDocumentsUrl);

  return {
    vergunning,
    isErrorDocuments: isError,
    isLoadingDocuments: isLoading,
    documents,
    title: vergunning?.title ?? 'Horecavergunning',
  };
}
