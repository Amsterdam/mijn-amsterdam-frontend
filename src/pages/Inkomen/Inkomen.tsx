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
import Alert from 'components/Alert/Alert';
import { useTabletScreen } from '../../hooks/media.hook';

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
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const items = Object.values(products).flatMap(product => product.items);

  const itemsRequested = items.filter(item => item.inProgress);
  const itemsGranted = items.filter(item => item.isGranted);
  const itemsDenied = items.filter(item => item.isDenied);

  const hasActiveRequests = !!itemsRequested.length;
  const hasGrantedRequests = !!itemsGranted.length;

  const isTabletScreen = useTabletScreen();

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.INKOMEN} />
        Werk &amp; inkomen
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
          <br />
          <ButtonLinkExternal to={ExternalUrls.INCOME_CONTACT}>
            Contact Werk & inkomen
          </ButtonLinkExternal>
        </p>
        {isError && (
          <Alert type="warning">
            Uw gegevens kunnen op dit moment niet worden getoond.
          </Alert>
        )}
        <DataLinkTable
          id="datalinktable-income-actual"
          rowHeight={isTabletScreen ? 'auto' : '6rem'}
          displayProps={DISPLAY_PROPS_ACTUAL}
          items={itemsRequested}
          title="Mijn lopende aanvragen"
          startCollapsed={false}
          isLoading={isLoading}
        />
        <DataLinkTable
          id="datalinktable-income-granted"
          rowHeight={isTabletScreen ? 'auto' : '6rem'}
          displayProps={DISPLAY_PROPS}
          items={itemsGranted}
          startCollapsed={hasActiveRequests}
          isLoading={isLoading}
          title="Mijn toegekende aanvragen"
        />
      </PageContentMainBody>
      <div className={styles.HistoricDataLinkTable}>
        <PageContentMainBody variant="boxed">
          <DataLinkTable
            id="datalinktable-income-denied"
            rowHeight={isTabletScreen ? 'auto' : '6rem'}
            displayProps={DISPLAY_PROPS}
            items={itemsDenied}
            startCollapsed={hasActiveRequests || hasGrantedRequests}
            title="Mijn afgewezen aanvragen"
            className={styles.DataLinkTableCurrent}
            isLoading={isLoading}
          />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
