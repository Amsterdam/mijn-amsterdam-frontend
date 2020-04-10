import {
  Alert,
  ChapterIcon,
  DetailPage,
  MyNotifications,
  PageContent,
  PageHeading,
} from '../../components';
import React, { useContext } from 'react';
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import styles from './MyNotifications.module.scss';

export default () => {
  const { NOTIFICATIONS } = useContext(AppContext);
  return (
    <DetailPage className={styles.MyNotifications}>
      <PageHeading className={styles.MainHeader} icon={<ChapterIcon />}>
        Actueel
      </PageHeading>
      <PageContent>
        {isError(NOTIFICATIONS) && (
          <Alert type="warning">
            <p>Niet alle updates kunnen op dit moment worden getoond.</p>
          </Alert>
        )}
      </PageContent>
      <MyNotifications
        isLoading={isLoading(NOTIFICATIONS)}
        total={NOTIFICATIONS.content.total}
        items={NOTIFICATIONS.content.items}
        noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
        trackCategory="Actueel overzicht"
      />
    </DetailPage>
  );
};
