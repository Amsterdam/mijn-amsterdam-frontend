import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import MyNotifications from 'components/MyNotifications/MyNotifications';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import styles from './MyNotifications.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import pageContentStyles from 'components/PageContentMain/PageContentMain.module.scss';
import classnames from 'classnames';

export default () => {
  const {
    MY_NOTIFICATIONS: {
      data: { items, total },
      isLoading,
      isError,
    },
  } = useContext(AppContext);
  return (
    <PageContentMain
      className={classnames(
        pageContentStyles.DetailPage,
        styles.MyNotifications
      )}
    >
      <PageContentMainHeading
        className={styles.MainHeader}
        icon={<ChapterIcon chapter={Chapters.MELDINGEN} />}
      >
        Actueel
      </PageContentMainHeading>
      <div className={pageContentStyles.PageContent}>
        {isError && (
          <Alert type="warning">
            Uw meldingen kunnen op dit moment niet geladen worden.
          </Alert>
        )}
      </div>
      <MyNotifications
        isLoading={isLoading}
        total={total}
        items={items}
        noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
        trackCategory="Actueel overzicht"
      />
    </PageContentMain>
  );
};
