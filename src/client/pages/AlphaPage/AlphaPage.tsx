import { Page, PageContent, PageHeading } from '../../components';

import React from 'react';
import styles from './AlphaPage.module.scss';

export default () => {
  return (
    <Page className={styles.AlphaPage}>
      <PageHeading>AlphaPage</PageHeading>
      <PageContent>
        <p>AlphaPage body</p>
      </PageContent>
    </Page>
  );
};
