import { useParams } from 'react-router-dom';

import { DecosZaakBase } from '../../../../server/services/decos/decos-types';
import { VergunningFrontendV2 } from '../../../../server/services/vergunningen/config-and-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { GenericDocument } from '../../../../universal/types';
import { BagThemas } from '../../../config/thema';
import {
  useAppStateGetter,
  useAppStateBagApi,
} from '../../../hooks/useAppState';

export function useVergunningDetailData<
  V extends DecosZaakBase = DecosZaakBase,
>() {
  type VergunningFrontendTyped = VergunningFrontendV2<V>;
  const appState = useAppStateGetter();
  const { VERGUNNINGEN } = appState;
  const { id } = useParams<{ id: VergunningFrontendTyped['id'] }>();
  const vergunning = VERGUNNINGEN.content?.find((item) => item.id === id);
  const fetchUrl = vergunning?.fetchUrl ?? '';
  const [vergunningDetailApiResponse] = useAppStateBagApi<{
    vergunning: VergunningFrontendTyped | null;
    documents: GenericDocument[];
  }>({
    url: fetchUrl,
    bagThema: BagThemas.VERGUNNINGEN,
    key: id,
  });
  const vergunningDetailResponseContent = vergunningDetailApiResponse.content;
  const vergunningDetail = vergunningDetailResponseContent?.vergunning ?? null;
  const vergunningDocuments = vergunningDetailResponseContent?.documents ?? [];

  return {
    vergunningExcerpt: vergunning,
    vergunningDetail,
    vergunningDocuments,
    isLoadingThemaData: isLoading(VERGUNNINGEN),
    isLoading: isLoading(vergunningDetailApiResponse),
    isError: isError(vergunningDetailApiResponse),
  };
}
