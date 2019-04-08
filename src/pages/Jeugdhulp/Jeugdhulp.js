import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';

export default () => {
  return (
    <PageContentMain>
      <PageContentMainHeading>Jeugdhulp</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>Jeugdhulp body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
