import { getThemaTitle } from './helpers';
import {
  kindTegoedLinkListItem,
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routeConfig,
  specificatieTableConfig,
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
import { useAddDocumentLinkComponents } from '../../../data-transform/useAddDocumentLinks';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
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
  const specificaties = useAddDocumentLinkComponents(
    HLI.content?.specificaties ?? []
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
    specificaties,
    themaId,
    title,
    hasKindtegoed,
    isLoading: isLoading(HLI),
    isError: isError(HLI, false),
    dependencyError,
    tableConfig,
    specificatieTableConfig,
    listPageTitle,
    listPageParamKind,
    linkListItems: hasKindtegoed
      ? [...linkListItems, kindTegoedLinkListItem]
      : linkListItems,
    breadcrumbs,
    routeConfig,
  };
}
