import {
  Alert,
  ChapterIcon,
  DetailPage,
  MyNotifications,
  PageContent,
  PageHeading,
  Pagination,
} from '../../components';
import React, { useContext, useState } from 'react';
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import styles from './MyNotifications.module.scss';

const PAGE_SIZE = 10;
const INITIAL_INDEX = [0, PAGE_SIZE - 1];

export default () => {
  const { NOTIFICATIONS } = useContext(AppContext);

  const [[startIndex, endIndex], setPageIndex] = useState(INITIAL_INDEX);
  const itemsPaginated =
    NOTIFICATIONS.content?.items.slice(startIndex, endIndex + 1) || [];

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
        total={NOTIFICATIONS.content!.total}
        items={itemsPaginated}
        noContentNotification="Er zijn op dit moment geen actuele meldingen voor u."
        trackCategory="Actueel overzicht"
      />
      {itemsPaginated.length > PAGE_SIZE && (
        <Pagination
          className={styles.Pagination}
          totalCount={NOTIFICATIONS.content!.total}
          pageSize={PAGE_SIZE}
          onPageClick={(page, ...index) => setPageIndex(index)}
        />
      )}
    </DetailPage>
  );
};
