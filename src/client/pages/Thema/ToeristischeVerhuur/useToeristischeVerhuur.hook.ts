import {
  listPageTitle,
  tableConfigLVVRegistraties,
  tableConfig,
  themaConfig,
  routeConfig,
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

  // const linkListItems: LinkProps[] = [
  //   {
  //     title: 'Meer over toeristenbelasting',
  //     to: 'https://www.amsterdam.nl/belastingen/toeristenbelasting/',
  //   },
  //   {
  //     title: 'Vakantieverhuur melden of registratienummer aanvragen',
  //     to: 'https://www.toeristischeverhuur.nl/portaal/login',
  //   },
  // ];

  // if (hasVergunningBB && !hasVergunningenVakantieVerhuur) {
  //   linkListItems.unshift({
  //     title: 'Meer informatie over bed & breakfast',
  //     to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/woonruimte-verhuren/vergunning-aanvragen-bed-breakfast/',
  //   });
  // }

  // if (hasVergunningenVakantieVerhuur) {
  //   linkListItems.unshift({
  //     title: 'Meer informatie over particuliere vakantieverhuur',
  //     to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/',
  //   });
  // }

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
    linkListItems: themaConfig.pageLinks,
    breadcrumbs,
    routeConfig,
  };
}
