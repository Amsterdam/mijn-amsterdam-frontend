import { PARKEER_CASE_TYPES } from './Parkeren-thema-config';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { DecosCaseType } from '../../../universal/types/vergunningen';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { tableConfig } from '../VergunningenV2/Vergunningen-thema-config';

function getVergunningenFromThemaVergunningen(content: VergunningFrontendV2[]) {
  const vergunningen = (content ?? [])
    .filter((vergunning) => {
      return PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType);
    })
    .map((vergunning) => ({
      ...vergunning,
      link: {
        ...vergunning.link,
        to: vergunning.link.to.replace('vergunningen', 'parkeren'),
      },
    }));

  return addLinkElementToProperty<VergunningFrontendV2>(
    vergunningen,
    'identifier'
  );
}

export function useParkerenData() {
  const { VERGUNNINGENv2, PARKEREN } = useAppStateGetter();
  const vergunningen = VERGUNNINGENv2.content ?? [];

  const parkeerVergunningenFromThemaVergunningen =
    getVergunningenFromThemaVergunningen(vergunningen);
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  return {
    tableConfig,
    parkeerVergunningenFromThemaVergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(VERGUNNINGENv2) || isLoading(PARKEREN),
    isError: isError(VERGUNNINGENv2) || isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    linkListItems: [
      {
        to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
        title: 'Meer over parkeervergunningen',
      },
    ],
  };
}
