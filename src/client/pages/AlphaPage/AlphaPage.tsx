import React from 'react';
import { Page, PageContent, PageHeading } from '../../components';
import styles from './AlphaPage.module.scss';

// import { useAppStateGetter } from '../../hooks/useAppState';

export default () => {
  // const { STATE_SLICE } = useAppStateGetter();

  return (
    <Page className={styles.AlphaPage}>
      <PageHeading>AlphaPage</PageHeading>
      <PageContent>
        <p>AlphaPage body</p>
      </PageContent>
    </Page>
  );
};
