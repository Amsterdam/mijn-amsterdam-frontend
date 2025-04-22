import { krefiaTableConfig } from './Krefia-thema-config';
import type { KrefiaDeepLink } from '../../../../server/services/krefia/krefia.types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { LinkProps } from '../../../../universal/types/App.types';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { ThemaTitles } from '../../../config/thema';
import { useAppStateGetter } from '../../../hooks/useAppState';

const kredietBankLink: LinkProps = {
  title: 'Meer informatie over Kredietbank Amsterdam',
  to: 'https://www.amsterdam.nl/werk-inkomen/kredietbank-amsterdam/',
};

const FIBULink: LinkProps = {
  title: 'Meer informatie over Budgetbeheer (FIBU)',
  to: 'https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/budgetbeheer',
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
    title: ThemaTitles.KREFIA,
  };
}
