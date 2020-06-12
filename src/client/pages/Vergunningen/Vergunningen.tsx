import { Page, PageContent, PageHeading } from '../../components';

import React from 'react';
import styles from './Vergunningen.module.scss';

export default () => {
  return (
    <Page className={styles.Vergunningen}>
      <PageHeading>Vergunningen</PageHeading>
      <PageContent>
        <p>Vergunningen body</p>
      </PageContent>
    </Page>
  );
};
