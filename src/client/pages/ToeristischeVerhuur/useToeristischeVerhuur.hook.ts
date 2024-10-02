import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { BBVergunning } from '../../../server/services/toeristische-verhuur/tv-powerbrowser-bb-vergunning';
import { VakantieverhuurVergunning } from '../../../server/services/toeristische-verhuur/tv-vakantieverhuur-vergunning';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import {
  addLinkElementToProperty,
  DisplayProps,
} from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import {
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfig,
} from './toeristischeVerhuur-thema-config';

export const BB_VERGUNNING_DISCLAIMER =
  'Bed & breakfast vergunningen die vóór 14 mei 2021 zijn aangevraagd kunnen niet worden getoond';

export function useToeristischeVerhuurThemaData() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();

  const hasVergunningenVakantieVerhuur =
    TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.some(
      (vergunning) => vergunning.title.endsWith('vakantieverhuur')
    );

  const hasVergunningenVakantieVerhuurVerleend =
    TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.some(
      (vergunning) =>
        vergunning.title.endsWith('vakantieverhuur') &&
        vergunning.result === 'Verleend'
    );

  const hasVergunningBB =
    !!TOERISTISCHE_VERHUUR.content?.bbVergunningen?.length;

  const hasVergunningBBVerleend =
    TOERISTISCHE_VERHUUR.content?.bbVergunningen?.some(
      (vergunning) =>
        vergunning.title.endsWith('bed & breakfast') &&
        vergunning.result === 'Verleend'
    );

  const vergunningen = addLinkElementToProperty<
    BBVergunning | VakantieverhuurVergunning
  >(
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

  let dependencyError = '';
  const isBBVergunningError = hasFailedDependency(
    TOERISTISCHE_VERHUUR,
    'bbVergunning'
  );
  const isVakantieVerhuurVergunningError = hasFailedDependency(
    TOERISTISCHE_VERHUUR,
    'vakantieVerhuurVergunning'
  );

  if (isBBVergunningError && !isVakantieVerhuurVergunningError) {
    dependencyError = 'Wij kunnen nu geen informatie tonen over Stadspassen';
  }

  if (isVakantieVerhuurVergunningError && !isBBVergunningError) {
    dependencyError = 'Wij kunnen nu geen informatie tonen over de regelingen';
  }

  return {
    vergunningen,
    lvvRegistraties,
    title: 'Toeristische verhuur',
    isLoading: isLoading(TOERISTISCHE_VERHUUR),
    isError: isError(TOERISTISCHE_VERHUUR, false),
    dependencyError,
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
    hasRegistrations,
    hasPermits,
    hasBothPermits,
    hasBothVerleend,
    hasVergunningBB,
  };
}
