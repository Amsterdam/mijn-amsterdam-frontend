import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import styles from './Inkomen.module.scss';
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
      data: { items },
    },
  } = useContext(AppContext);

  const itemsRequested = items.filter(item => item.inProgress);
  const itemsGranted = items.filter(item => item.isGranted);
  const itemsDenied = items.filter(item => item.isDenied);

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.INKOMEN} />
        Inkomen
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        <p>
          Hieronder vindt u een overzicht van alle voorzieningen die u hebt ter
          aanvulling of ondersteuning bij een laag inkomen. Wilt u meer weten
          over de inkomensregelingen van de gemeente Amsterdam?
        </p>
        <p>
          <ButtonLinkExternal to={ExternalUrls.ABOUT_INCOME_SUPPORT}>
            Lees meer over inkomensondersteuning
          </ButtonLinkExternal>
        </p>
        {!!itemsRequested.length && (
          <DataLinkTable
            id="income-actual"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS_ACTUAL}
            items={itemsRequested}
            title="Mijn lopende aanvragen"
            startCollapsed={false}
          />
        )}
        <DataLinkTable
          id="income-granted"
          rowHeight="6rem"
          displayProps={DISPLAY_PROPS}
          items={itemsGranted}
          title="Mijn toegekende aanvragen"
        />
      </PageContentMainBody>
      <div className={styles.HistoricDataLinkTable}>
        <PageContentMainBody variant="boxed">
          <DataLinkTable
            id="income-denied"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS}
            items={itemsDenied}
            title="Mijn afgewezen aanvragen"
            className={styles.DataLinkTableCurrent}
          />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
