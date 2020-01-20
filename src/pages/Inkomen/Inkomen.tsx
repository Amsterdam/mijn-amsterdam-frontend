import React, { useContext } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import { ChapterTitles } from 'config/Chapter.constants';
import styles from './Inkomen.module.scss';
import { ExternalUrls } from 'config/App.constants';
import Alert from 'components/Alert/Alert';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Linkd from 'components/Button/Button';

export default () => {
  const {
    FOCUS: {
      data: { products },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const items = Object.values(products).flatMap(product => product.items);
  const itemsRequested = items.filter(item => !item.hasDecision);
  const itemsDecided = items.filter(item => item.hasDecision);
  const hasActiveRequests = !!itemsRequested.length;

  return (
    <OverviewPage className={styles.Inkomen}>
      <PageHeading icon={<ChapterIcon />}>{ChapterTitles.INKOMEN}</PageHeading>
      <PageContent>
        <p>
          Hieronder vindt u een overzicht van alle voorzieningen die u hebt ter
          aanvulling of ondersteuning bij een laag inkomen.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_REGELINGEN}>
            Naar alle regelingen voor Werk en inkomen
          </Linkd>
          <br />
          <Linkd external={true} href={ExternalUrls.WPI_CONTACT}>
            Contact Werk en inkomen
          </Linkd>
        </p>
        {isError && (
          <Alert type="warning">
            We kunnen op dit moment geen gegevens tonen.
          </Alert>
        )}
      </PageContent>
      <DataLinkTable
        id="datalinktable-income-actual"
        items={itemsRequested}
        title="Mijn lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoading}
        track={{
          category: 'Werk en inkomen overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
      />
      <DataLinkTable
        id="datalinktable-income-granted"
        items={itemsDecided}
        startCollapsed={hasActiveRequests}
        isLoading={isLoading}
        title="Mijn besluiten"
        track={{
          category: 'Werk en inkomen overzicht / Besluiten',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen besluiten."
      />
    </OverviewPage>
  );
};
