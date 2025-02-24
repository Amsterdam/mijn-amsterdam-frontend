import {
  listPageTitle,
  routes,
  tableConfigLVVRegistraties,
  tableConfig,
} from './toeristischeVerhuur-thema-config';
import { ToeristischeVerhuurVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { LinkProps } from '../../../universal/types/App.types';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export const BB_VERGUNNING_DISCLAIMER =
  'Bed & breakfast vergunningen die vóór 14 mei 2021 zijn aangevraagd kunnen niet worden getoond';

export function useToeristischeVerhuurThemaData() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();

  const hasVergunningenVakantieVerhuur =
    !!TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.length;

  const hasVergunningenVakantieVerhuurVerleend =
    TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen?.some(
      (vergunning) => vergunning.decision === 'Verleend'
    );

  const hasVergunningBB =
    !!TOERISTISCHE_VERHUUR.content?.bbVergunningen?.length;

  const hasVergunningBBVerleend =
    TOERISTISCHE_VERHUUR.content?.bbVergunningen?.some(
      (vergunning) => vergunning.decision === 'Verleend'
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

  const linkListItems: LinkProps[] = [
    {
      title: 'Meer over toeristenbelasting',
      to: 'https://www.amsterdam.nl/veelgevraagd/toeristenbelasting-2c7c2',
    },
    {
      title: 'Vakantieverhuur melden of registratienummer aanvragen',
      to: 'https://www.toeristischeverhuur.nl/portaal/login',
    },
  ];

  if (hasVergunningBB && !hasVergunningenVakantieVerhuur) {
    linkListItems.unshift({
      title: 'Meer informatie over bed & breakfast',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/',
    });
  }

  if (hasVergunningenVakantieVerhuur) {
    linkListItems.unshift({
      title: 'Meer informatie over particuliere vakantieverhuur',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/',
    });
  }

  return {
    vergunningen,
    lvvRegistraties,
    title: ThemaTitles.TOERISTISCHE_VERHUUR,
    isLoading: isLoading(TOERISTISCHE_VERHUUR),
    isError: isError(TOERISTISCHE_VERHUUR, false),
    hasLVVRegistratiesError,
    hasBBVergunningError,
    hasVakantieVerhuurVergunningError,
    routes,
    tableConfigVergunningen: tableConfig,
    tableConfigLVVRegistraties,
    listPageTitle,
    hasRegistrations,
    hasPermits,
    hasVergunningenVakantieVerhuur,
    hasBothVerleend,
    hasVergunningBB,
    linkListItems,
  };
}
