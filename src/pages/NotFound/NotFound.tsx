import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './NotFound.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.NotFound}>
      <PageContentMainHeading>Helaas</PageContentMainHeading>
      <p>De pagina waar u naar op zoek was bestaat niet (meer).</p>
    </PageContentMain>
  );
};
