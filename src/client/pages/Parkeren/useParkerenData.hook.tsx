import { PARKEER_CASE_TYPES } from './Parkeren.config';
import { Vergunning } from '../../../server/services/vergunningen/vergunningen';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { isError, isLoading } from '../../../universal/helpers/api';
import { DecosCaseType } from '../../../universal/types/vergunningen';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useVergunningenTransformed } from '../Vergunningen/useVergunningenTransformed.hook';
import { tableConfig } from '../VergunningenV2/config';

function getVergunningenFromThemaVergunningen(
  content: VergunningFrontendV2[] | Vergunning[] | null
) {
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
  return addLinkElementToProperty<VergunningFrontendV2 | Vergunning>(
    vergunningen,
    'identifier'
  );
}

export function useParkerenData() {
  const { VERGUNNINGENv2, VERGUNNINGEN, PARKEREN } = useAppStateGetter();
  const vergunningenState = FeatureToggle.vergunningenV2Active
    ? VERGUNNINGENv2
    : VERGUNNINGEN;
  const vergunningen =
    (vergunningenState === VERGUNNINGEN
      ? useVergunningenTransformed(VERGUNNINGEN)
      : VERGUNNINGENv2.content) ?? [];

  const parkeerVergunningenFromThemaVergunningen =
    getVergunningenFromThemaVergunningen(vergunningen);
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  return {
    tableConfig,
    parkeerVergunningenFromThemaVergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(vergunningenState) || isLoading(PARKEREN),
    isError: isError(vergunningenState) || isError(PARKEREN),
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
