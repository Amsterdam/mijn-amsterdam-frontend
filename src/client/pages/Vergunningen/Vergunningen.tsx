import React from 'react';
import { ChapterTitles } from '../../../universal/config/index';
import { ChapterIcon, PageContent, PageHeading } from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import styles from './Vergunningen.module.scss';

export default () => {
  return (
    <OverviewPage className={styles.Vergunningen}>
      <PageHeading icon={<ChapterIcon />}>
        {ChapterTitles.VERGUNNINGEN}
      </PageHeading>
      <PageContent>
        <p>Vergunningen body</p>
      </PageContent>
    </OverviewPage>
  );
};
