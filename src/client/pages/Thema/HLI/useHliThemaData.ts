import { getThemaTitle } from './helpers';
import {
  kindTegoedLinkListItem,
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routeConfig,
  tableConfig,
  themaId,
} from './HLI-thema-config';
import { useStadspassen } from './useStadspassen.hook';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useHliThemaData() {
  const { HLI } = useAppStateGetter();
  const stadspassen = useStadspassen();
  const hasStadspas = !!HLI.content?.stadspas?.stadspassen?.length;
  const regelingen = addLinkElementToProperty<HLIRegelingFrontend>(
    HLI.content?.regelingen ?? [],
    'title',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(themaId);
  const hasRegelingen = !!regelingen.length;
  const title = getThemaTitle(hasStadspas, hasRegelingen);
  const hasKindtegoed = stadspassen?.some((stadspas) =>
    stadspas.budgets.some((budget) =>
      budget.title.toLowerCase().includes('kind')
    )
  );

  let dependencyError = '';
  const isStadspasError = hasFailedDependency(HLI, 'stadspas');
  const isRegelingenError = hasFailedDependency(HLI, 'regelingen');

  if (isStadspasError && !isRegelingenError) {
    dependencyError = 'Wij kunnen nu geen informatie tonen over Stadspassen';
  }

  if (isRegelingenError && !isStadspasError) {
    dependencyError = 'Wij kunnen nu geen informatie tonen over de regelingen';
  }

  return {
    stadspassen,
    dateExpiryFormatted: HLI.content?.stadspas?.dateExpiryFormatted ?? null,
    regelingen,
    title,
    hasKindtegoed,
    isLoading: isLoading(HLI),
    isError: isError(HLI, false),
    dependencyError,
    tableConfig,
    listPageTitle,
    listPageParamKind,
    linkListItems: hasKindtegoed
      ? [...linkListItems, kindTegoedLinkListItem]
      : linkListItems,
    breadcrumbs,
    routeConfig,
  };
}
