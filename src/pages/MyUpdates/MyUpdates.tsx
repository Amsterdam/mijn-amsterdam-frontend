import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import MyUpdates from 'components/MyUpdates/MyUpdates';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import styles from './MyUpdates.module.scss';
import Heading from 'components/Heading/Heading';
import Alert from 'components/Alert/Alert';

export default () => {
  const {
    MY_UPDATES: {
      data: { items, total },
      isLoading,
      isError,
    },
  } = useContext(AppContext);
  return (
    <PageContentMain className={styles.MyUpdates} variant="full">
      <PageContentMainHeading
        variant="boxedWithIcon"
        className={styles.MainHeader}
      >
        <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
        Alle meldingen
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {isError && (
          <Alert type="warning">
            Uw meldingen kunnen op dit moment niet geladen worden.
          </Alert>
        )}
        <Heading el="h3" size="mediumLarge" className={styles.PanelHeading}>
          Actueel
        </Heading>
        <MyUpdates
          isLoading={isLoading}
          total={total}
          items={items.filter(item => item.isActual)}
          trackCategory={'MA_Mijn_meldingen/Actuele_meldingen'}
        />
      </PageContentMainBody>
      <div className={styles.PreviousUpdatesPanel}>
        <PageContentMainBody variant="boxed">
          <Heading el="h3" size="mediumLarge" className={styles.PanelHeading}>
            Eerdere meldingen
          </Heading>
          <MyUpdates
            isLoading={isLoading}
            total={total}
            items={items.filter(item => !item.isActual)}
            trackCategory={'MA_Mijn_meldingen/Eerdere_meldingen'}
          />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
