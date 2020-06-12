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

const DISPLAY_PROPS = {
  identifier: 'Zaakkenmerk',
  caseType: 'Soort vergunning',
  title: 'Omschrijving',
  dateRequest: 'Aanvraagdatum',
};

export default () => {
  const { VERGUNNINGEN } = useContext(AppContext);

  const vergunningenActual = useMemo(() => {
    if (!VERGUNNINGEN.content?.length) {
      return [];
    }
    const items = VERGUNNINGEN.content
      .filter(x => x)
      .map(item => {
        return {
          ...item,
          title: item.title.slice(0, 40) + '...',
          dateRequest: defaultDateFormat(item.dateRequest),
        };
      });
    return addTitleLinkComponent(items, 'identifier');
  }, [VERGUNNINGEN.content]);

  return (
    <OverviewPage className={styles.Vergunningen}>
      <PageHeading icon={<ChapterIcon />}>
        {ChapterTitles.VERGUNNINGEN}
      </PageHeading>
      <PageContent>
        <p>
          Wilt u een evenement organiseren op straat of in een gebouw? Dan hebt
          u meestal een evenementenvergunning nodig, maar soms is een melding
          voldoende. Kijk hier hoe het werkt.
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
        title="Voorlopige vergunningen (toegekend onder voorbehoud)"
        noItemsMessage="U hebt geen voorlopige vergunningen (toegekend onder voorbehoud)."
        hasItems={!!vergunningenActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VERGUNNINGEN)}
        track={{
          category: 'Vergunningen overzicht / Voorlopige vergunningen',
          name: 'Datatabel',
        }}
      >
        <Table
          titleKey="identifier"
          displayProps={DISPLAY_PROPS}
          items={vergunningenActual}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
};
