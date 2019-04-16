import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './NotFound.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.NotFound}>
      <PageContentMainHeading variant="medium">Helaas</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>De pagina waar u naar op zoek was bestaat niet (meer).</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
