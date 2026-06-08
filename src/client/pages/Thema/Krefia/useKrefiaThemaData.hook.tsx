import { krefiaTableConfig, themaConfig } from './Krefia-thema-config.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import type { LinkProps } from '../../../../universal/types/App.types.ts';
import { MaLink } from '../../../components/MaLink/MaLink.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';

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
  const deepLinks = (KREFIA.content?.deepLinks ?? []).map((deepLink) => {
    return {
      ...deepLink,
      detailLinkComponent: (
        <MaLink href={deepLink.link.to} rel="noopener noreferrer">
          {deepLink.link.title}
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
    tableConfig: krefiaTableConfig,
    themaId: themaConfig.id,
    title: themaConfig.title,
    themaConfig,
    linkListItems,
  };
}
