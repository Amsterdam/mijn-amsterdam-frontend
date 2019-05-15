import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import styles from './Burgerzaken.module.scss';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import { ExternalUrls } from 'App.constants';

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

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
        Burgerzaken
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {!!itemsRequested.length && (
          <DataLinkTable
            id="datalinktable-burgerzaken-actual"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS_ACTUAL}
            items={itemsRequested}
            title="Mijn lopende aanvragen"
            startCollapsed={false}
          />
        )}
        {!!itemsGranted.length && (
          <DataLinkTable
            id="datalinktable-burgerzaken-granted"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS}
            items={itemsGranted}
            title="Mijn toegekende aanvragen"
          />
        )}
      </PageContentMainBody>
      {!!itemsDenied.length && (
        <div className={styles.HistoricDataLinkTable}>
          <PageContentMainBody variant="boxed">
            <DataLinkTable
              id="datalinktable-burgerzaken-denied"
              rowHeight="6rem"
              displayProps={DISPLAY_PROPS}
              items={itemsDenied}
              title="Mijn afgewezen aanvragen"
              className={styles.DataLinkTableCurrent}
            />
          </PageContentMainBody>
        </div>
      )}
    </PageContentMain>
  );
};
