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

const getFilteredVergunningen = <T extends VergunningFrontendV2 | Vergunning>(
  content: T[] | null | undefined
) =>
  addLinkElementToProperty<T>(
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

export function useParkerenData() {
  const { VERGUNNINGENv2, VERGUNNINGEN, PARKEREN } = useAppStateGetter();

  let parkeervergunningen: VergunningFrontendV2[] | Vergunning[] = [];

  parkeervergunningen = FeatureToggle.vergunningenV2Active
    ? getFilteredVergunningen(VERGUNNINGENv2.content)
    : getFilteredVergunningen(VERGUNNINGEN.content);

  return {
    tableConfig,
    parkeervergunningen,
    isLoading: FeatureToggle.vergunningenV2Active
      ? isLoading(VERGUNNINGENv2)
      : isLoading(VERGUNNINGEN),
    isError: FeatureToggle.vergunningenV2Active
      ? isError(VERGUNNINGENv2)
      : isError(VERGUNNINGEN),
    parkerenUrlSSO: PARKEREN.content?.url,
    isLoadingParkerenUrl: isLoading(PARKEREN),
  };
}
