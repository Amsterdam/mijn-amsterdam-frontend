import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { getThemaTitle } from './helpers';
import {
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfig,
} from './hli-thema-config';

export function useHliThemaData() {
  const { HLI } = useAppStateGetter();
  const stadspassen = HLI.content?.stadspas?.stadspassen;
  const hasStadspas = !!HLI.content?.stadspas?.stadspassen?.length;
  const regelingen = addLinkElementToProperty<HLIRegeling>(
    HLI.content?.regelingen ?? [],
    'title',
    true
  );

  const hasRegelingen = !!regelingen.length;
  const title = getThemaTitle(hasStadspas, hasRegelingen);
  const hasKindtegoed = stadspassen?.some((stadspas) =>
    stadspas.budgets.some((budget) =>
      budget.description.toLowerCase().includes('kind')
    )
  );

  return {
    stadspassen,
    regelingen,
    title,
    hasKindtegoed,
    isLoading: isLoading(HLI),
    isError: isError(HLI),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
  };
}
