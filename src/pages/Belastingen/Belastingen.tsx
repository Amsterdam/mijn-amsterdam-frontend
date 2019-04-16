import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Belastingen.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.Belastingen}>
      <PageContentMainHeading>Belastingen</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>Belastingen body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
