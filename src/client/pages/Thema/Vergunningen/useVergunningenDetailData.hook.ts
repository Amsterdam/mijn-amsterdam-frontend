import { useParams } from 'react-router';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook.ts';
import { themaConfig } from './Vergunningen-thema-config.ts';
import type { ZaakFrontendCombined } from '../../../../server/services/vergunningen/config-and-types.ts';
import { logger } from '../../../helpers/logging.ts';

export function useVergunningenDetailData<T extends ZaakFrontendCombined>(
  vergunningen: T[]
) {
  const { id } = useParams<{ id: ZaakFrontendCombined['id'] }>();
  const vergunning = vergunningen.find((vergunning) => vergunning.id === id);

  const hasFetchDocumentsUrl = vergunning && 'fetchDocumentsUrl' in vergunning;
  const fetchDocumentsUrl = hasFetchDocumentsUrl
    ? vergunning?.fetchDocumentsUrl
    : undefined;

  const {
    documents: fetchedDocuments,
    isLoading: isLoadingDocuments,
    isError: isErrorDocuments,
  } = useVergunningDocumentList(fetchDocumentsUrl);

  if (hasFetchDocumentsUrl && vergunning?.fetchSourceRaw) {
    // Utility url

    logger.info(`Decos data: ${vergunning.fetchSourceRaw}`);
  }

  const documents = hasFetchDocumentsUrl
    ? fetchedDocuments
    : vergunning && 'documents' in vergunning
      ? vergunning.documents
      : [];

  return {
    themaId: themaConfig.id,
    vergunning,
    isErrorDocuments,
    isLoadingDocuments,
    documents,
    title: vergunning?.title,
    themaConfig,
  };
}
