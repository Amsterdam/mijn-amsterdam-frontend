import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AppState, { SessionState } from './AppState';
import { AppRoutes } from './App.constants';
import MainHeader, {
  MainHeaderProps,
} from './components/MainHeader/MainHeader';
import MainFooter from './components/MainFooter/MainFooter';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import styles from './App.module.scss';
import MyUpdates from 'pages/MyUpdates/MyUpdates';
import MyTips from 'pages/MyTips/MyTips';
import Dashboard from 'pages/Dashboard/Dashboard';
import Landing from 'pages/Landing/Landing';
import Burgerzaken from 'pages/Burgerzaken/Burgerzaken';
import Belastingen from 'pages/Belastingen/Belastingen';
import Jeugdhulp from 'pages/Jeugdhulp/Jeugdhulp';
import Wonen from 'pages/Wonen/Wonen';
import Inkomen from 'pages/Inkomen/Inkomen';
import Zorg from 'pages/Zorg/Zorg';

function MainApp({ person, isAuthenticated }: MainHeaderProps) {
  return (
    <>
      <MainHeader person={person} isAuthenticated={isAuthenticated} />
      <div className={styles.App}>
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Redirect from={AppRoutes.API_LOGIN} to={AppRoutes.ROOT} />
          <Route path={AppRoutes.MY_UPDATES} component={MyUpdates} />
          <Route path={AppRoutes.PROFILE} component={Profile} />
          <Route path={AppRoutes.MY_TIPS} component={MyTips} />
          <Route path={AppRoutes.BURGERZAKEN} component={Burgerzaken} />
          <Route path={AppRoutes.BELASTINGEN} component={Belastingen} />
          <Route path={AppRoutes.JEUGDHULP} component={Jeugdhulp} />
          <Route path={AppRoutes.WONEN} component={Wonen} />
          <Route path={AppRoutes.INKOMEN} component={Inkomen} />
          <Route path={AppRoutes.ZORG} component={Zorg} />
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
                  person={BRP.person}
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
