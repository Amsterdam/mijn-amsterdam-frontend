import { getThemaTitle } from './helpers';
import {
  kindTegoedLinkListItem,
  linkListItems,
  listPageParamKind,
  listPageTitle,
  tableConfig,
  themaId,
  type ListPageParamKind,
} from './HLI-thema-config';
import styles from './HLIThema.module.scss';
import { useStadspassen } from './useStadspassen.hook';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { entries } from '../../../../universal/helpers/utils';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useHliThemaData() {
  const { HLI } = useAppStateGetter();
  const stadspassen = useStadspassen();
  const hasStadspas = !!HLI.content?.stadspas?.length;
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

  const tableStyles = {
    [listPageParamKind.actual]: styles.HuidigeRegelingen,
    [listPageParamKind.historic]: styles.EerdereRegelingen,
  } as const satisfies Record<ListPageParamKind, string>;

  const tableConfigWithStyles = Object.fromEntries(
    entries(tableConfig).map(([kind, config]) => [
      kind,
      {
        ...config,
        className: tableStyles[kind],
      },
    ])
  );

  return {
    stadspassen,
    regelingen,
    title,
    hasKindtegoed,
    isLoading: isLoading(HLI),
    isError: isError(HLI, false),
    dependencyError,
    tableConfig: tableConfigWithStyles,
    listPageTitle,
    listPageParamKind,
    linkListItems: hasKindtegoed
      ? [...linkListItems, kindTegoedLinkListItem]
      : linkListItems,
    breadcrumbs,
  };
}
