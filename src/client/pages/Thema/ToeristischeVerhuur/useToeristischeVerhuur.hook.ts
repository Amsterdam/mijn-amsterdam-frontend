import {
  bbVergunningPageLinkItem,
  vvVergunningPageLinkItem,
  listPageTitle,
  tableConfigLVVRegistraties,
  tableConfig,
  themaConfig,
} from './ToeristischeVerhuur-thema-config';
import { ToeristischeVerhuurVergunning } from '../../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export const BB_VERGUNNING_DISCLAIMER =
  'Bed & breakfast vergunningen die vóór 14 mei 2021 zijn aangevraagd kunnen niet worden getoond';

export function useToeristischeVerhuurThemaData() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();

  const hasVergunningenVakantieVerhuur =
    !!TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.length;

  const hasVergunningenVakantieVerhuurVerleend =
    TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.some(
      (vergunning) => vergunning.isVerleend
    );

  const hasVergunningBB =
    !!TOERISTISCHE_VERHUUR.content?.bbVergunningen?.length;

  const hasVergunningBBVerleend =
    TOERISTISCHE_VERHUUR.content?.bbVergunningen?.some(
      (vergunning) => vergunning.isVerleend
    );

  const vergunningen = addLinkElementToProperty<ToeristischeVerhuurVergunning>(
    [
      ...(TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen ?? []),
      ...(TOERISTISCHE_VERHUUR.content?.bbVergunningen ?? []),
    ],
    'identifier',
    true
  );

  const lvvRegistraties = TOERISTISCHE_VERHUUR.content?.lvvRegistraties ?? [];
  const hasRegistrations = !!lvvRegistraties.length;
  const hasPermits = hasVergunningenVakantieVerhuur || hasVergunningBB;
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

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    vergunningen,
    lvvRegistraties,
    id: themaConfig.id,
    title: themaConfig.title,
    isLoading: isLoading(TOERISTISCHE_VERHUUR),
    isError: isError(TOERISTISCHE_VERHUUR, false),
    hasLVVRegistratiesError,
    hasBBVergunningError,
    hasVakantieVerhuurVergunningError,
    tableConfigVergunningen: tableConfig,
    tableConfigLVVRegistraties,
    listPageTitle,
    hasRegistrations,
    hasPermits,
    hasVergunningenVakantieVerhuur,
    hasBothVerleend,
    hasVergunningBB,
    linkListItems:
      hasVergunningBB && !hasVergunningenVakantieVerhuur
        ? [...themaConfig.pageLinks, bbVergunningPageLinkItem]
        : [...themaConfig.pageLinks, vvVergunningPageLinkItem], // TO DO YACINE > wanneer ik naar een link ga krijg ik soms op de themapagina ineens 4 links ipv 3 > naar kijken met andere ontwikkelaar
    breadcrumbs,
    listPageConfig: themaConfig.listPage,
    detailPageConfig: themaConfig.detailPage,
  };
}
