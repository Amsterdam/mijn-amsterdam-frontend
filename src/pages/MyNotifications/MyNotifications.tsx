import { DetailPage, PageContent } from 'components/Page/Page';
import React, { useContext } from 'react';

import Alert from 'components/Alert/Alert';
import { AppContext } from 'AppState';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import MyNotifications from 'components/MyNotifications/MyNotifications';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './MyNotifications.module.scss';

export default () => {
  const {
    UPDATES: {
      data: { items, total },
      isLoading,
      isError,
    },
  } = useContext(AppContext);
  return (
    <DetailPage className={styles.MyNotifications}>
      <PageHeading className={styles.MainHeader} icon={<ChapterIcon />}>
        Actueel
      </PageHeading>
      <PageContent>
        {isError && (
          <Alert type="warning">
            <p>Niet alle updates kunnen op dit moment worden getoond.</p>
          </Alert>
        )}
      </PageContent>
      <MyNotifications
        isLoading={isLoading}
        total={total}
        items={items}
        noContentNotification="Er zijn op dit moment geen actuele updates voor u."
        trackCategory="Actueel overzicht"
      />
    </DetailPage>
  );
};
