import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './AlphaPage.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.AlphaPage}>
      <PageContentMainHeading>AlphaPage</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>AlphaPage body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
