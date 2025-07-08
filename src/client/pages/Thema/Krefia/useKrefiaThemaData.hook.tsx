import {
  krefiaTableConfig,
  routeConfig,
  themaTitle,
} from './Krefia-thema-config.ts';
import type { KrefiaDeepLink } from '../../../../server/services/krefia/krefia.types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { LinkProps } from '../../../../universal/types/App.types.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';

const kredietBankLink: LinkProps = {
  title: 'Meer informatie over Kredietbank Amsterdam',
  to: 'https://www.amsterdam.nl/werk-inkomen/kredietbank-amsterdam/',
};

const FIBULink: LinkProps = {
  title: 'Meer informatie over Budgetbeheer (FIBU)',
  to: 'https://www.amsterdam.nl/werk-en-inkomen/bijstandsuitkering/geld-laten-beheren-team-fibu/',
};

export function useKrefiaThemaData() {
  const { KREFIA } = useAppStateGetter();
  const linkListItems: LinkProps[] = [];
  const deepLinks_ = KREFIA.content?.deepLinks ?? [];

  const deepLinks = addLinkElementToProperty<KrefiaDeepLink>(
    deepLinks_,
    'title',
    true
  );

  const hasKredietbank = !!deepLinks?.find(
    ({ type }) => type === 'schuldhulp' || type === 'lening'
  );
  const hasFIBU = !!deepLinks?.find(({ type }) => type === 'budgetbeheer');
  const hasKrefia = hasKredietbank || hasFIBU;

  if (hasKredietbank || !hasKrefia) {
    linkListItems.push(kredietBankLink);
  }

  if (hasFIBU || !hasKrefia) {
    linkListItems.push(FIBULink);
  }

  return {
    deepLinks,
    hasFIBU,
    hasKredietbank,
    hasKrefia,
    isError: isError(KREFIA),
    isLoading: isLoading(KREFIA),
    linkListItems,
    tableConfig: krefiaTableConfig,
    title: themaTitle,
    routeConfig,
  };
}
