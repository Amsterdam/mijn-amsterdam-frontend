import React from 'react';
import Page from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './AlphaPage.module.scss';
import { PageContent } from 'components/Page/Page';

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
