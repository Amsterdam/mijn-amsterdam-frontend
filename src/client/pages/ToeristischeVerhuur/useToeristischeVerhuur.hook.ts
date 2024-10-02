import { ToeristischeVerhuurVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import {
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfigLVVRegistraties,
  tableConfigVergunningen,
} from './toeristischeVerhuur-thema-config';

export const BB_VERGUNNING_DISCLAIMER =
  'Bed & breakfast vergunningen die vóór 14 mei 2021 zijn aangevraagd kunnen niet worden getoond';

export function useToeristischeVerhuurThemaData() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();

  const hasVergunningenVakantieVerhuur =
    !!TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.length;

  const hasVergunningenVakantieVerhuurVerleend =
    TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.some(
      (vergunning) => vergunning.result === 'Verleend'
    );

  const hasVergunningBB =
    !!TOERISTISCHE_VERHUUR.content?.bbVergunningen?.length;

  const hasVergunningBBVerleend =
    TOERISTISCHE_VERHUUR.content?.bbVergunningen?.some(
      (vergunning) => vergunning.result === 'Verleend'
    );

  const vergunningen = addLinkElementToProperty<ToeristischeVerhuurVergunning>(
    [
      ...(TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen ?? []),
      ...(TOERISTISCHE_VERHUUR.content?.bbVergunningen ?? []),
    ],
    'title',
    true
  );
  const lvvRegistraties = TOERISTISCHE_VERHUUR.content?.lvvRegistraties ?? [];
  const hasRegistrations = !!lvvRegistraties.length;
  const hasPermits = hasVergunningenVakantieVerhuur || hasVergunningBB;
  const hasBothPermits = hasVergunningenVakantieVerhuur && hasVergunningBB;
  const hasBothVerleend =
    hasVergunningenVakantieVerhuurVerleend && hasVergunningBBVerleend;

  const hasBBVergunningError = hasFailedDependency(
    TOERISTISCHE_VERHUUR,
    'bbVergunning'
  );
  const hasVakantieVerhuurVergunningError = hasFailedDependency(
    TOERISTISCHE_VERHUUR,
    'vakantieVerhuurVergunning'
  );
  const hasLVVRegistratiesError = hasFailedDependency(
    TOERISTISCHE_VERHUUR,
    'lvvRegistraties'
  );

  return {
    vergunningen,
    lvvRegistraties,
    title: 'Toeristische verhuur',
    isLoading: isLoading(TOERISTISCHE_VERHUUR),
    isError: isError(TOERISTISCHE_VERHUUR, false),
    hasLVVRegistratiesError,
    hasBBVergunningError,
    hasVakantieVerhuurVergunningError,
    routes,
    tableConfigVergunningen,
    tableConfigLVVRegistraties,
    listPageTitle,
    listPageParamKind,
    hasRegistrations,
    hasPermits,
    hasBothPermits,
    hasBothVerleend,
    hasVergunningBB,
  };
}
