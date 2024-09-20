import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { ListPageParamKind, tableConfig } from '../VergunningenV2/config';
import { DecosCaseType } from '../../../universal/types/vergunningen';

const PARKEER_CASE_TYPES: Set<DecosCaseType> = new Set([
  'GPK',
  'GPP',
  'Parkeerontheffingen Blauwe zone particulieren',
  'Eigen parkeerplaats',
  'Eigen parkeerplaats opheffen',
  'Touringcar Dagontheffing',
  'Touringcar Jaarontheffing',
]);

export function useParkerenData(kind?: ListPageParamKind) {
  const { VERGUNNINGENv2 } = useAppStateGetter();
  let vergunningen = addLinkElementToProperty<VergunningFrontendV2>(
    VERGUNNINGENv2.content ?? []
  );
  let displayProps = {};
  let title = '';

  let vergunningenListFilter = null;
  let vergunningenListSort = null;

  if (kind) {
    ({
      title,
      displayProps,
      filter: vergunningenListFilter,
      sort: vergunningenListSort,
    } = tableConfig[kind]);

    vergunningen = vergunningen
      .filter(vergunningenListFilter)
      .sort(vergunningenListSort);
  }

  const parkeervergunningen = vergunningen.filter((vergunning) =>
    PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
  );

  return {
    parkeervergunningen,
    title,
    displayProps,
    isLoading: isLoading(VERGUNNINGENv2),
    isError: isError(VERGUNNINGENv2),
  };
}
