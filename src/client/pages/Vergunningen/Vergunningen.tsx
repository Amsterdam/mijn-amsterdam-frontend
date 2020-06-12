import React, { useContext, useMemo } from 'react';
import { ChapterTitles } from '../../../universal/config/index';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  Linkd,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import styles from './Vergunningen.module.scss';

const DISPLAY_PROPS = {
  identifier: '',
  caseType: '',
  title: '',
  dateStart: '',
};

export default () => {
  const { VERGUNNINGEN } = useContext(AppContext);

  const vergunningenActual = useMemo(() => {
    return VERGUNNINGEN.content?.filter(x => x) || [];
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
        <Table displayProps={DISPLAY_PROPS} items={vergunningenActual} />
      </SectionCollapsible>
    </OverviewPage>
  );
};
