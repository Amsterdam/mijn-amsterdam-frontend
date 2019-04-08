import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Burgerzaken.module.scss';

export default () => {
  return (
    <PageContentMain>
      <PageContentMainHeading>Burgerzaken</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>Burgerzaken body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
