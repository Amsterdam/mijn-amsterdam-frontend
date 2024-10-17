import { Vergunning } from '../../../server/services';
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
  const { VERGUNNINGEN } = useAppStateGetter();
  const parkeervergunningen = addLinkElementToProperty<Vergunning>(
    (VERGUNNINGEN.content ?? []).filter((vergunning) =>
      PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
    )
  );

  return {
    tableConfig,
    parkeervergunningen,
    isLoading: isLoading(VERGUNNINGEN),
    isError: isError(VERGUNNINGEN),
  };
}
