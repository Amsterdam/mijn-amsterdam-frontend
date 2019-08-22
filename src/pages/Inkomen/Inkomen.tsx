import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters, ChapterTitles } from 'App.constants';
import styles from './Inkomen.module.scss';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import { ExternalUrls } from 'App.constants';
import Alert from 'components/Alert/Alert';
import { useTabletScreen } from 'hooks/media.hook';

const DISPLAY_PROPS = {
  datePublished: 'besluit',
};

const DISPLAY_PROPS_ACTUAL = {
  dateStart: 'aanvraag',
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

  const itemsRequested = items.filter(item => !item.hasDecision);
  const itemsDecided = items.filter(item => item.hasDecision);
  const hasActiveRequests = !!itemsRequested.length;

  const isTabletScreen = useTabletScreen();

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.INKOMEN} />
        {ChapterTitles.INKOMEN}
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
            Contact {ChapterTitles.INKOMEN}
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
          trackCategory="MA_Inkomen/Thema_Pagina/Lopende_aanvragen"
          noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        />
        <DataLinkTable
          id="datalinktable-income-granted"
          rowHeight={isTabletScreen ? 'auto' : '6rem'}
          displayProps={DISPLAY_PROPS}
          items={itemsDecided}
          startCollapsed={hasActiveRequests}
          isLoading={isLoading}
          title="Mijn besluiten"
          trackCategory="MA_Inkomen/Thema_Pagina/Mijn_Besluiten"
          noItemsMessage="U hebt op dit moment geen besluiten."
        />
      </PageContentMainBody>
    </PageContentMain>
  );
};
