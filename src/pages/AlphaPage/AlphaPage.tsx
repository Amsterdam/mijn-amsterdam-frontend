import React from 'react';
import Page, { PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
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
