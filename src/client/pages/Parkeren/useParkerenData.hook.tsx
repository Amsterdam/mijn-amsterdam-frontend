import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
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

export function useParkerenData() {
  const { VERGUNNINGENv2, PARKEREN } = useAppStateGetter();
  const parkeervergunningen = addLinkElementToProperty<VergunningFrontendV2>(
    (VERGUNNINGENv2.content ?? []).filter((vergunning) =>
      PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
    )
  );

  return {
    tableConfig,
    parkeervergunningen,
    isLoading: isLoading(VERGUNNINGENv2),
    isError: isError(VERGUNNINGENv2),
    parkerenUrlSSO: PARKEREN.content?.url,
    isLoadingParkerenUrl: isLoading(PARKEREN),
  };
}
