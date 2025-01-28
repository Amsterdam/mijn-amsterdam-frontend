import { useParams } from 'react-router-dom';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook';
import { DecosZaakBase } from '../../../server/services/decos/decos-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';

export function useVergunningenDetailData<T extends DecosZaakBase>(
  vergunningen: VergunningFrontend<T>[]
) {
  const { id } = useParams<{ id: VergunningFrontend['id'] }>();
  const vergunning = vergunningen.find((vergunning) => vergunning.id === id);
  const fetchDocumentsUrl = vergunning?.fetchDocumentsUrl;
  const documents = useVergunningDocumentList(fetchDocumentsUrl);

  return {
    vergunning,
    documents,
    title: vergunning?.title ?? 'Vergunning',
  };
}
