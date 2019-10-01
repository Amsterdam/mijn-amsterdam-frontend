import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import MyNotifications from 'components/MyNotifications/MyNotifications';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import styles from './MyNotifications.module.scss';

export default () => {
  const {
    MY_NOTIFICATIONS: {
      data: { items, total },
      isLoading,
      isError,
    },
  } = useContext(AppContext);
  return (
    <PageContentMain className={styles.MyNotifications} variant="full">
      <PageContentMainHeading
        variant="boxedWithIcon"
        className={styles.MainHeader}
      >
        <ChapterHeadingIcon chapter={Chapters.MELDINGEN} />
        Actueel
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {isError && (
          <Alert type="warning">
            Uw meldingen kunnen op dit moment niet geladen worden.
          </Alert>
        )}
        <MyNotifications
          isLoading={isLoading}
          total={total}
          items={items}
          noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
          trackCategory="Actueel overzicht"
        />
      </PageContentMainBody>
    </PageContentMain>
  );
};
