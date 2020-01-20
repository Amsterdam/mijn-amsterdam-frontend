import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import MyNotifications from 'components/MyNotifications/MyNotifications';
import { DetailPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import React, { useContext } from 'react';

import styles from './MyNotifications.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default () => {
  const {
    MELDINGEN: {
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
            <p>Niet alle meldingen kunnen op dit moment worden getoond.</p>
          </Alert>
        )}
      </PageContent>
      <MyNotifications
        isLoading={isLoading}
        total={total}
        items={items}
        noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
        trackCategory="Actueel overzicht"
      />
    </DetailPage>
  );
};
