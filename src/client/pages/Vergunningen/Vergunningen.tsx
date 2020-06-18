import React, { useContext, useMemo } from 'react';
import { ChapterTitles } from '../../../universal/config/index';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  // Linkd,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import styles from './Vergunningen.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { Vergunning } from '../../../server/services/vergunningen';

const DISPLAY_PROPS = {
  identifier: 'Zaakkenmerk',
  caseType: 'Soort vergunning',
  title: 'Omschrijving',
  dateRequest: 'Aanvraagdatum',
};

export default () => {
  const { VERGUNNINGEN } = useContext(AppContext);

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
    return addTitleLinkComponent(items, 'identifier');
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
      <PageHeading icon={<ChapterIcon />}>
        {ChapterTitles.VERGUNNINGEN}
      </PageHeading>
      <PageContent>
        <p>
          Wilt u een evenement organiseren op straat of in een gebouw? Dan hebt
          u meestal een evenementenvergunning nodig, maar soms is een melding
          voldoende.
        </p>
        {/* <p>
          <Linkd external={true} href="https://mijn.amsterdam.nl/">
            Meer informatie op amsterdam.nl
          </Linkd>
        </p> */}
        {isError(VERGUNNINGEN) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-vergunningen-actual"
        title="Lopende vergunningsaanvragen"
        noItemsMessage="U hebt geen lopende vergunningsaanvragen."
        hasItems={!!vergunningenActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VERGUNNINGEN)}
        track={{
          category: 'Vergunningen overzicht / Lopende vergunningsaanvragen',
          name: 'Datatabel',
        }}
      >
        <Table
          titleKey="identifier"
          displayProps={DISPLAY_PROPS}
          items={vergunningenActual}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-vergunningen-previous"
        title="Eerdere vergunningsaanvragen"
        noItemsMessage="U hebt geen eerdere vergunningsaanvragen."
        hasItems={!!vergunningenPrevious.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VERGUNNINGEN)}
        track={{
          category: 'Vergunningen overzicht / Lopende vergunningsaanvragen',
          name: 'Datatabel',
        }}
      >
        <Table
          titleKey="identifier"
          displayProps={DISPLAY_PROPS}
          items={vergunningenPrevious}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
};
