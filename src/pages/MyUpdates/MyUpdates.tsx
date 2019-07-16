import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import MyUpdates from 'components/MyUpdates/MyUpdates';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import styles from './MyUpdates.module.scss';

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
        <ChapterHeadingIcon chapter={Chapters.MY_UPDATES} />
        Mijn meldingen
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {isError && (
          <Alert type="warning">
            Uw meldingen kunnen op dit moment niet geladen worden.
          </Alert>
        )}
        <MyUpdates
          isLoading={isLoading}
          total={total}
          items={items}
          trackCategory={'MA_Mijn_meldingen/Actuele_meldingen'}
          noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
        />
      </PageContentMainBody>
    </PageContentMain>
  );
};
