import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Dashboard.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.Dashboard}>
      <PageContentMainHeading variant="medium">
        Dashboard title
      </PageContentMainHeading>
      <PageContentMainBody />
    </PageContentMain>
  );
};
