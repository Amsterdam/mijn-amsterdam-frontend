import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Privacy.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.Privacy}>
      <PageContentMainHeading>Privacy</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>Privacy body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
