import { ReactNode, useMemo } from 'react';

import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import styles from './Krefia.module.scss';
import type { KrefiaDeepLink, KrefiaDeepLinks } from '../../../server/services';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading, isError } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  LinkdInline,
  LoadingContent,
  SectionCollapsible,
  Table,
} from '../../components';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
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
            <LinkdInline external={true} href={link.url}>
              {linkText}
            </LinkdInline>
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
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>
          {ThemaTitles.KREFIA}
        </PageHeadingV2>
        {isLoading(KREFIA) && (
          <PageContentCell>
            <LoadingContent />
          </PageContentCell>
        )}
        <PageContentCell>
          {((isKredietbank && isFIBU) || showText) && (
            <Paragraph className="ams-mb--md">
              Een online plek waar u alle informatie over uw geldzaken kunt
              vinden als klant van Budgetbeheer (FIBU) en/of Kredietbank
              Amsterdam.
            </Paragraph>
          )}
          {isKredietbank && !isFIBU && (
            <Paragraph className="ams-mb--md">
              Een online plek waar u alle informatie over uw geldzaken kunt
              vinden als klant van Kredietbank Amsterdam.
            </Paragraph>
          )}
          {!isKredietbank && isFIBU && (
            <Paragraph className="ams-mb--md">
              Een online plek waar u alle informatie over uw geldzaken kunt
              vinden als klant van Budgetbeheer (FIBU).
            </Paragraph>
          )}

          <LinkList className="ams-mb--md">
            {(isKredietbank || showText) && (
              <LinkList.Link
                rel="noopener noreferrer"
                href="https://www.amsterdam.nl/werk-inkomen/kredietbank-amsterdam/"
              >
                Meer informatie over Kredietbank Amsterdam
              </LinkList.Link>
            )}
            {(isFIBU || showText) && (
              <LinkList.Link
                href="https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/budgetbeheer"
                rel="noreferrer noopener"
              >
                Meer informatie over Budgetbeheer (FIBU)
              </LinkList.Link>
            )}
          </LinkList>
        </PageContentCell>
        {isError(KREFIA) && (
          <PageContentCell>
            <ErrorAlert>
              We kunnen op dit moment geen geldzaken tonen.
            </ErrorAlert>
          </PageContentCell>
        )}
      </PageContentV2>
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
    </OverviewPageV2>
  );
}
