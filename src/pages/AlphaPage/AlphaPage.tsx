import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './AlphaPage.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.AlphaPage}>
      <PageContentMainHeading>AlphaPage</PageContentMainHeading>
      <p>AlphaPage body</p>
    </PageContentMain>
  );
};
