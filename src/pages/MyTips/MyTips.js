import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';

export default () => {
  return (
    <PageContentMain>
      <PageContentMainHeading>MyTips title</PageContentMainHeading>
      <PageContentMainBody>
        <p>MyTips body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
