import React, { useMemo } from 'react';
import { Vergunning } from '../../../server/services/vergunningen';
import { ChapterTitles } from '../../../universal/config/index';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  // Linkd,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import { useAppStateAtom } from '../../hooks/useAppState';
import styles from './Vergunningen.module.scss';

const DISPLAY_PROPS = {
  caseType: 'Soort vergunning',
  identifier: 'Kenmerk',
  dateRequest: 'Aangevraagd',
};

const DISPLAY_PROPS_HISTORY = {
  caseType: 'Soort vergunning',
  identifier: 'Kenmerk',
  decision: 'Resultaat',
};

export default () => {
  const { VERGUNNINGEN } = useAppStateAtom();

  const vergunningen: Vergunning[] = useMemo(() => {
    if (!VERGUNNINGEN.content?.length) {
      return [];
    }
    const items: Vergunning[] = VERGUNNINGEN.content
      .filter(x => x)
      .map(item => {
        return {
          ...item,
          title:
            item.title.length > 45
              ? item.title.slice(0, 40) + '...'
              : item.title,
          dateRequest: defaultDateFormat(item.dateRequest),
        };
      });
    return addTitleLinkComponent(items, 'caseType');
  }, [VERGUNNINGEN.content]);

  const vergunningenPrevious = useMemo(() => {
    return vergunningen.filter(
      vergunning => vergunning.status === 'Afgehandeld'
    );
  }, [vergunningen]);

  const vergunningenActual = useMemo(() => {
    return vergunningen.filter(
      vergunning => vergunning.status !== 'Afgehandeld'
    );
  }, [vergunningen]);

  return (
    <OverviewPage className={styles.Vergunningen}>
      <PageHeading isLoading={isLoading(VERGUNNINGEN)} icon={<ChapterIcon />}>
        {ChapterTitles.VERGUNNINGEN}
      </PageHeading>
      <PageContent>
        <p>
          Hier ziet u een overzicht van uw aanvragen voor vergunningen en
          ontheffingen. Op dit moment ziet u hier uw aanvragen voor een
          RVV-verkeersontheffing, een tijdelijke verkeersmaatregel en een
          objectvergunning. Andere vergunningen komen er later bij.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BE4341B52-1FC0-4E17-AB68-2B3AFE15160A%7D"
          >
            Ontheffing RVV en TVM aanvragen
          </Linkd>
        </p>
        {isError(VERGUNNINGEN) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-vergunningen-actual"
        title="Lopende aanvragen"
        noItemsMessage="U hebt geen lopende aanvragen."
        hasItems={!!vergunningenActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VERGUNNINGEN)}
        track={{
          category: 'Vergunningen overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="caseType"
          displayProps={DISPLAY_PROPS}
          items={vergunningenActual}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-vergunningen-previous"
        title="Eerdere aanvragen"
        noItemsMessage="U hebt geen eerdere aanvragen."
        hasItems={!!vergunningenPrevious.length}
        startCollapsed={true}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VERGUNNINGEN)}
        track={{
          category: 'Vergunningen overzicht / Eerdere aanvragen',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="caseType"
          displayProps={DISPLAY_PROPS_HISTORY}
          items={vergunningenPrevious}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
};
