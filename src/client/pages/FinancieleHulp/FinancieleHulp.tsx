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
import { useMemo } from 'react';

const DISPLAY_PROPS = {
  title: 'Status',
  url: 'Bekijk op FiBu',
};

export default function FinancieleHulp() {
  const { FINANCIELE_HULP } = useAppStateGetter();
  const leningen = useMemo(() => {
    const lening = FINANCIELE_HULP?.content?.deepLinks?.lening;
    if (!FINANCIELE_HULP?.content?.deepLinks?.lening) {
      return undefined;
    }
    return {
      ...lening,
      url: (
        <LinkdInline external={true} href={lening?.url}>
          Bekijk uw lening
        </LinkdInline>
      ),
    };
  }, [FINANCIELE_HULP.content]);
  const schuldregelingen = useMemo(() => {
    const schuldregeling = FINANCIELE_HULP?.content?.deepLinks?.schuldhulp;
    if (!schuldregeling) {
      return undefined;
    }
    return {
      ...schuldregeling,
      url: (
        <LinkdInline external={true} href={schuldregeling.url}>
          Bekijk uw schuldregeling
        </LinkdInline>
      ),
    };
  }, [FINANCIELE_HULP.content]);
  const budgetbeheer = useMemo(() => {
    const budgetbeheer = FINANCIELE_HULP.content?.deepLinks?.budgetbeheer;
    if (!budgetbeheer) {
      return [];
    }

    return {
      ...budgetbeheer,
      url: (
        <LinkdInline external={true} href={budgetbeheer.url}>
          Bekijk uw lening
        </LinkdInline>
      ),
    };
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
          <br />
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/werk-inkomen/bijstandsuitkering/budgetbeheer/krefia-fibu/"
          >
            Meer informatie over FiBu
          </Linkd>
        </p>
      </PageContent>
      {schuldregelingen && (
        <SectionCollapsible
          id="SectionCollapsible-financiele-hulp-schuldregeling"
          title="Schuldregeling"
          hasItems={!!schuldregelingen}
          startCollapsed={!!schuldregelingen}
          className={styles.SectionBorderTop}
          isLoading={isLoading(FINANCIELE_HULP)}
          track={{
            category: 'Financiële hulp overzicht / Schuldregeling',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.HulpTable}
            displayProps={DISPLAY_PROPS}
            items={[schuldregelingen]}
          />
        </SectionCollapsible>
      )}
      {!!leningen && (
        <SectionCollapsible
          id="SectionCollapsible-financiele-hulp-leningen"
          title="Leningen"
          hasItems={!!leningen}
          startCollapsed={!!schuldregelingen}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(FINANCIELE_HULP)}
          track={{
            category: 'Financiële hulp overzicht / Leningen',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.HulpTable}
            displayProps={DISPLAY_PROPS}
            items={[leningen]}
          />
        </SectionCollapsible>
      )}
      {!!budgetbeheer && (
        <SectionCollapsible
          id="SectionCollapsible-financiele-hulp-budgetbeheer"
          title="Financieel budgetbeheer"
          hasItems={!!budgetbeheer}
          startCollapsed={!!schuldregelingen && !!leningen}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(FINANCIELE_HULP)}
          track={{
            category: 'Financiële hulp overzicht / Financieel budgetbeheer',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.HulpTable}
            displayProps={DISPLAY_PROPS}
            items={[budgetbeheer]}
          />
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
}
