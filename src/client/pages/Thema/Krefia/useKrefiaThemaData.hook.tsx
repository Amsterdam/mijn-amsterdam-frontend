import {
  krefiaTableConfig,
  routeConfig,
  themaId,
  themaTitle,
} from './Krefia-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { LinkProps } from '../../../../universal/types/App.types';
import { MaLink } from '../../../components/MaLink/MaLink';
import { useAppStateGetter } from '../../../hooks/useAppState';

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

  const deepLinks = deepLinks_.map((link) => {
    return {
      ...link,
      detailLinkComponent: (
        <MaLink
          maVariant="fatNoDefaultUnderline"
          href={link.link.to}
          rel="noopener noreferrer"
        >
          {link.link.title}
        </MaLink>
      ),
    };
  });

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
    id: themaId,
    title: themaTitle,
    routeConfig,
  };
}
