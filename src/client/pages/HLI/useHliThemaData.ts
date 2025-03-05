import { getThemaTitle } from './helpers';
import {
  kindTegoedLinkListItem,
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfig,
} from './HLI-thema-config';
import { useStadspassen } from './useStadspassen.hook';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useHliThemaData() {
  const { HLI } = useAppStateGetter();
  const stadspassen = useStadspassen();
  const hasStadspas = !!HLI.content?.stadspas?.length;
  const regelingen = addLinkElementToProperty<HLIRegeling>(
    HLI.content?.regelingen ?? [],
    'title',
    true
  );

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
    regelingen,
    title,
    hasKindtegoed,
    isLoading: isLoading(HLI),
    isError: isError(HLI, false),
    dependencyError,
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
    linkListItems: hasKindtegoed
      ? [...linkListItems, kindTegoedLinkListItem]
      : linkListItems,
  };
}
