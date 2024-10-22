import { Vergunning } from '../../../server/services/vergunningen/vergunningen';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { isError, isLoading } from '../../../universal/helpers/api';
import { CaseType, DecosCaseType } from '../../../universal/types/vergunningen';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { tableConfig } from '../VergunningenV2/config';

export const PARKEER_CASE_TYPES: Set<DecosCaseType> = new Set([
  CaseType.GPK,
  CaseType.GPP,
  CaseType.BZP,
  CaseType.EigenParkeerplaats,
  CaseType.EigenParkeerplaatsOpheffen,
  CaseType.TouringcarDagontheffing,
  CaseType.TouringcarJaarontheffing,
]);

function getFilteredVergunningen(
  content: VergunningFrontendV2[] | Vergunning[] | null
) {
  return addLinkElementToProperty<VergunningFrontendV2 | Vergunning>(
    (content ?? [])
      .filter((vergunning) =>
        PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
      )
      .map((vergunning) => ({
        ...vergunning,
        link: {
          ...vergunning.link,
          to: vergunning.link.to.replace('vergunningen', 'parkeren'),
        },
      }))
  );
}

export function useParkerenData() {
  const { VERGUNNINGENv2, VERGUNNINGEN, PARKEREN } = useAppStateGetter();
  const vergunningenState = FeatureToggle.vergunningenV2Active
    ? VERGUNNINGENv2
    : VERGUNNINGEN;
  const vergunningen = vergunningenState.content;

  const parkeervergunningen = getFilteredVergunningen(vergunningen);

  return {
    tableConfig,
    parkeervergunningen,
    isLoading: isLoading(vergunningenState),
    isError: isError(vergunningenState),
    parkerenUrlSSO: PARKEREN.content?.url,
    isLoadingParkerenUrl: isLoading(PARKEREN),
  };
}
