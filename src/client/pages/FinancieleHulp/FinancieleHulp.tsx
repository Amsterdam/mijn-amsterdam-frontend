import { useMemo } from 'react';

import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isLoading } from '../../../universal/helpers/api';
import {
  ChapterIcon,
  Linkd,
  LinkdInline,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './FinancieleHulp.module.scss';

// import { useAppStateGetter } from '../../hooks/useAppState';
const DISPLAY_PROPS = {
  title: 'Status',
  url: 'Bekijk op FiBu',
};

export default function FinancieleHulp() {
  const { FINANCIELE_HULP } = useAppStateGetter();
  const leningen = useMemo(() => {
    if (!FINANCIELE_HULP.content?.leningen) {
      return [];
    }
    return FINANCIELE_HULP.content?.leningen.map((lening) => {
      return {
        ...lening,
        url: (
          <LinkdInline external={true} href={lening.url}>
            Bekijk uw lening
          </LinkdInline>
        ),
      };
    });
  }, [FINANCIELE_HULP.content]);
  const schuldregelingen = useMemo(() => {
    if (!FINANCIELE_HULP.content?.schuldregelingen) {
      return [];
    }
    return FINANCIELE_HULP.content?.schuldregelingen.map((lening) => {
      return {
        ...lening,
        url: (
          <LinkdInline external={true} href={lening.url}>
            Bekijk uw schuldregeling
          </LinkdInline>
        ),
      };
    });
  }, [FINANCIELE_HULP.content]);
  const budgetbeheer = useMemo(() => {
    if (!FINANCIELE_HULP.content?.budgetbeheer) {
      return [];
    }
    return FINANCIELE_HULP.content?.budgetbeheer.map((lening) => {
      return {
        ...lening,
        url: (
          <LinkdInline external={true} href={lening.url}>
            Bekijk uw lening
          </LinkdInline>
        ),
      };
    });
  }, [FINANCIELE_HULP.content]);
  return (
    <OverviewPage className={styles.FinancieleHulp}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(FINANCIELE_HULP)}
        icon={<ChapterIcon />}
      >
        {' '}
        {ChapterTitles.FINANCIELE_HULP}
      </PageHeading>
      <PageContent>
        <p>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Budgetbeheer (FIBU).
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/werk-inkomen/kredietbank-amsterdam/"
          >
            Meer informatie over de Kredietbank
          </Linkd>
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/budgetbeheer/krefia-fibu/"
          >
            Meer informatie over FiBu
          </Linkd>
        </p>
      </PageContent>
      {!!schuldregelingen.length && (
        <SectionCollapsible
          id="SectionCollapsible-financiele-hulp-schuldregeling"
          title="Schuldregeling"
          hasItems={!!schuldregelingen?.length}
          startCollapsed={false}
          className={styles.SectionBorderTop}
          isLoading={isLoading(FINANCIELE_HULP)}
          track={{
            category: 'Financiele hulp overzicht / Schuldregeling',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.HulpTable}
            titleKey="title"
            displayProps={DISPLAY_PROPS}
            items={schuldregelingen}
          />
        </SectionCollapsible>
      )}
      {!!leningen.length && (
        <SectionCollapsible
          id="SectionCollapsible-financiele-hulp-leningen"
          title="Leningen"
          hasItems={!!leningen?.length}
          startCollapsed={false}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(FINANCIELE_HULP)}
          track={{
            category: 'Financiele hulp overzicht / Leningen',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.HulpTable}
            titleKey="title"
            displayProps={DISPLAY_PROPS}
            items={leningen}
          />
        </SectionCollapsible>
      )}
      {!!budgetbeheer.length && (
        <SectionCollapsible
          id="SectionCollapsible-financiele-hulp-budgetbeheer"
          title="Financieel budgetbeheer"
          hasItems={!!budgetbeheer?.length}
          startCollapsed={false}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(FINANCIELE_HULP)}
          track={{
            category: 'Financiele hulp overzicht / Financieel budgetbeheer',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.HulpTable}
            titleKey="title"
            displayProps={DISPLAY_PROPS}
            items={budgetbeheer}
          />
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
}
