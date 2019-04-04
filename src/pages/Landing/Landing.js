import { LOGIN_URL } from 'App.constants';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React from 'react';

export default () => {
  return (
    <PageContentMain>
      <PageContentMainHeading>Welkom bij Mijn Amsterdam</PageContentMainHeading>
      <PageContentMainBody>
        <p>
          <a href={LOGIN_URL}>Login</a>
        </p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
