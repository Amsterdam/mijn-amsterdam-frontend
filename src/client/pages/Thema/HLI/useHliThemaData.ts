import { getThemaTitle } from './helpers.ts';
import {
  kindTegoedPageLinkItem,
  listPageParamKind,
  listPageTitle,
  specificatieTableConfig,
  tableConfig,
  themaConfig,
} from './HLI-thema-config.ts';
import { useStadspassen } from './useStadspassen.hook.tsx';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types.ts';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAddDocumentLinkComponents } from '../../../data-transform/useAddDocumentLinks.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

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

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
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
    themaId: themaConfig.id,
    title,
    hasKindtegoed,
    isLoading: isLoading(HLI),
    isError: isError(HLI, false),
    dependencyError,
    tableConfig,
    specificatieTableConfig,
    listPageTitle,
    listPageParamKind,
    pageLinks: hasKindtegoed
      ? [...themaConfig.pageLinks, kindTegoedPageLinkItem]
      : themaConfig.pageLinks,
    breadcrumbs,
    themaConfig,
  };
}
