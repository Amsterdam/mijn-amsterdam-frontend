import { useParams } from 'react-router-dom';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook';
import { DecosZaakBase } from '../../../server/services/decos/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { Themas } from '../../../universal/config/thema';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useVergunningenDetailData<T extends DecosZaakBase>(
  vergunningen: VergunningFrontend<T>[]
) {
  const { id } = useParams<{ id: VergunningFrontend['id'] }>();
  const vergunning = vergunningen.find((vergunning) => vergunning.id === id);
  const fetchDocumentsUrl = vergunning?.fetchDocumentsUrl;
  const documents = useVergunningDocumentList(fetchDocumentsUrl);
  const themaLink = useThemaMenuItemByThemaID(Themas.VERGUNNINGEN);

  return {
    vergunning,
    documents,
    title: vergunning?.title ?? 'Vergunning',
    themaPaginaBreadcrumb: themaLink,
  };
}
