import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
import Dashboard from 'pages/Dashboard/Dashboard';
import { LOGIN_URL } from 'App.constants';

export default () => {
  const {
    SESSION: { isAuthenticated },
  } = useContext(AppContext);

  if (isAuthenticated) {
    return <Dashboard />;
  }

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
