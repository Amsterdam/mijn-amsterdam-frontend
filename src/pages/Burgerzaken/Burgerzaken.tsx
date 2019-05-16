import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import styles from './Burgerzaken.module.scss';

const DISPLAY_PROPS = {
  datePublished: 'besluit',
};

const DISPLAY_PROPS_ACTUAL = {
  datePublished: 'aanvraag',
};

export default () => {
  const {
    FOCUS: {
      data: { products },
    },
  } = useContext(AppContext);

  const items = products.Stadspas ? products.Stadspas.items : [];

  const itemsRequested = items.filter(item => item.inProgress);
  const itemsGranted = items.filter(item => item.isGranted);
  const itemsDenied = items.filter(item => item.isDenied);

  const hasActiveRequests = !!itemsRequested.length;
  const hasGrantedRequests = !!itemsGranted.length;
  const hasDeniedRequests = !!itemsDenied.length;

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
        Burgerzaken
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {hasActiveRequests && (
          <DataLinkTable
            id="datalinktable-burgerzaken-actual"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS_ACTUAL}
            items={itemsRequested}
            title="Mijn lopende aanvragen"
            startCollapsed={false}
          />
        )}
        {hasGrantedRequests && (
          <DataLinkTable
            id="datalinktable-burgerzaken-granted"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS}
            items={itemsGranted}
            startCollapsed={hasActiveRequests}
            title="Mijn toegekende aanvragen"
          />
        )}
      </PageContentMainBody>
      {hasDeniedRequests && (
        <div className={styles.HistoricDataLinkTable}>
          <PageContentMainBody variant="boxed">
            <DataLinkTable
              id="datalinktable-burgerzaken-denied"
              rowHeight="6rem"
              displayProps={DISPLAY_PROPS}
              items={itemsDenied}
              startCollapsed={hasActiveRequests || hasDeniedRequests}
              title="Mijn afgewezen aanvragen"
              className={styles.DataLinkTableCurrent}
            />
          </PageContentMainBody>
        </div>
      )}
    </PageContentMain>
  );
};
