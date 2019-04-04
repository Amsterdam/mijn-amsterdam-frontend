import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AppState, { SessionState } from './AppState';
import { AppRoutes } from './App.constants.js';
import MainHeader from './components/MainHeader/MainHeader.js';
import MainFooter from './components/MainFooter/MainFooter.js';
import Profile from './pages/Profile/Profile.js';
import NotFound from './pages/NotFound/NotFound.js';
import styles from './App.module.scss';
import MyUpdates from 'pages/MyUpdates/MyUpdates';
import MyTips from 'pages/MyTips/MyTips';
import Dashboard from 'pages/Dashboard/Dashboard';
import Landing from 'pages/Landing/Landing';

function MainApp({ me, isAuthenticated }) {
  return (
    <>
      <MainHeader me={me} isAuthenticated={isAuthenticated} />
      <div className={styles.App}>
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Redirect from={AppRoutes.API_LOGIN} to={AppRoutes.ROOT} />
          <Route path={AppRoutes.MY_UPDATES} component={MyUpdates} />
          <Route path={AppRoutes.PROFILE} component={Profile} />
          <Route path={AppRoutes.MY_TIPS} component={MyTips} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MainFooter />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionState
        render={session => {
          if (session.isLoading) {
            return <p>...</p>;
          }
          // Render the main app pnly if we are authenticated
          return session.isAuthenticated ? (
            <AppState
              session={session}
              render={({ SESSION, BRP }) => (
                <MainApp
                  me={BRP.me}
                  isAuthenticated={SESSION.isAuthenticated}
                />
              )}
            />
          ) : (
            <>
              <MainHeader />
              <Landing />
              <MainFooter />
            </>
          );
        }}
      />
    </BrowserRouter>
  );
}
