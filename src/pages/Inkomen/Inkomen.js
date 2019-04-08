import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Inkomen.module.scss';

export default () => {
  return (
    <PageContentMain>
      <PageContentMainHeading>Inkomen</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>Inkomen body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
