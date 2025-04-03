import { useParams } from 'react-router';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook';
import { DecosZaakBase } from '../../../server/services/decos/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';

export function useVergunningenDetailData<T extends DecosZaakBase>(
  vergunningen: VergunningFrontend<T>[]
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
    title: vergunning?.title ?? 'Vergunning',
  };
}
