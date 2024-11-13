import { ReactNode, useMemo } from 'react';

import { Link } from '@amsterdam/design-system-react';

import styles from './Krefia.module.scss';
import type { KrefiaDeepLink, KrefiaDeepLinks } from '../../../server/services';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading, isError } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  ThemaIcon,
  LoadingContent,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

const DISPLAY_PROPS = {
  title: 'Status',
  to: 'Bekijk op Krefia',
};

function useDeepLinks(deepLinksContent?: KrefiaDeepLinks) {
  return useMemo(() => {
    if (!deepLinksContent) {
      return;
    }
    const deepLinks: Record<string, [KrefiaDeepLink & { to: ReactNode }]> = {};
    for (const [key, link] of Object.entries(deepLinksContent).filter(
      ([, link]) => link !== null
    )) {
      let linkText = 'Bekijk';
      switch (key) {
        case 'budgetbeheer':
          linkText = 'Ga naar budgetbeheer';
          break;
        case 'lening':
          linkText = 'Bekijk uw lening';
          break;
        case 'schuldhulp':
          linkText = 'Bekijk uw schuldregeling';
          break;
      }
      deepLinks[key] = [
        {
          ...link,
          to: (
            <Link variant="inline" href={link.url}>
              {linkText}
            </Link>
          ),
        },
      ];
    }
    return deepLinks;
  }, [deepLinksContent]);
}

export default function Krefia() {
  const { KREFIA } = useAppStateGetter();
  const deepLinks = useDeepLinks(KREFIA.content?.deepLinks);
  const isKredietbank = !!deepLinks?.schuldhulp || !!deepLinks?.lening;
  const isFIBU = !!deepLinks?.budgetbeheer;
  let showText = false;

  if (!isKredietbank && !isFIBU) {
    showText = true;
  }
  return (
    <OverviewPage className={styles.Krefia}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.KREFIA}
      </PageHeading>
      <PageContent>
        {isLoading(KREFIA) && <LoadingContent />}
        {((isKredietbank && isFIBU) || showText) && (
          <p>
            Een online plek waar u alle informatie over uw geldzaken kunt vinden
            als klant van Budgetbeheer (FIBU) en/of Kredietbank Amsterdam.
          </p>
        )}
        {isKredietbank && !isFIBU && (
          <p>
            Een online plek waar u alle informatie over uw geldzaken kunt vinden
            als klant van Kredietbank Amsterdam.
          </p>
        )}
        {!isKredietbank && isFIBU && (
          <p>
            Een online plek waar u alle informatie over uw geldzaken kunt vinden
            als klant van Budgetbeheer (FIBU).
          </p>
        )}

        <p>
          {(isKredietbank || showText) && (
            <>
              <Link href="https://www.amsterdam.nl/werk-inkomen/kredietbank-amsterdam/">
                Meer informatie over Kredietbank Amsterdam
              </Link>
              <br />
            </>
          )}

          {(isFIBU || showText) && (
            <Link href="https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/budgetbeheer">
              Meer informatie over Budgetbeheer (FIBU)
            </Link>
          )}
        </p>
        {isError(KREFIA) && (
          <ErrorAlert>We kunnen op dit moment geen geldzaken tonen.</ErrorAlert>
        )}
      </PageContent>
      {deepLinks?.schuldhulp && (
        <SectionCollapsible
          id="SectionCollapsible-krefia-schuldregeling"
          title="Schuldregeling"
          startCollapsed={false}
          className={styles.SectionBorderTop}
          isLoading={isLoading(KREFIA)}
        >
          <Table
            className={styles.HulpTable}
            displayProps={DISPLAY_PROPS}
            items={deepLinks.schuldhulp}
          />
        </SectionCollapsible>
      )}
      {deepLinks?.lening && (
        <SectionCollapsible
          id="SectionCollapsible-krefia-leningen"
          title="Leningen"
          startCollapsed={!!deepLinks?.schuldhulp?.length}
          isLoading={isLoading(KREFIA)}
        >
          <Table
            className={styles.HulpTable}
            displayProps={DISPLAY_PROPS}
            items={deepLinks.lening}
          />
        </SectionCollapsible>
      )}
      {deepLinks?.budgetbeheer && (
        <SectionCollapsible
          id="SectionCollapsible-krefia-budgetbeheer"
          title="Budgetbeheer"
          startCollapsed={
            !!deepLinks?.schuldhulp?.length || !!deepLinks?.lening?.length
          }
          isLoading={isLoading(KREFIA)}
        >
          <Table
            className={styles.HulpTable}
            displayProps={DISPLAY_PROPS}
            items={deepLinks.budgetbeheer}
          />
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
}
