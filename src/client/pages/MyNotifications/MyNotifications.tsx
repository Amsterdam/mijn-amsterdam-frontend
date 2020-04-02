import {
  Alert,
  ChapterIcon,
  DetailPage,
  MyNotifications,
  PageContent,
  PageHeading,
} from '../../components';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
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
