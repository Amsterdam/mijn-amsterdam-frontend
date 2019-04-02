import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AppState from './AppState';
import { AppRoutes } from './App.constants.js';
import MainHeader from './components/MainHeader/MainHeader.js';
import MainFooter from './components/MainFooter/MainFooter.js';
import Profile from './pages/Profile/Profile.js';
import NotFound from './pages/NotFound/NotFound.js';
import styles from './App.module.scss';
import Landing from 'pages/Landing/Landing';
import MijnUpdates from 'pages/MijnUpdates/MijnUpdates';

export default function App() {
  return (
    <BrowserRouter>
      <AppState>
        <MainHeader />
        <div className={styles.App}>
          <Switch>
            <Route exact path={AppRoutes.ROOT} component={Landing} />
            {/* <Route path={AppRoutes.BURGERZAKEN} />
              <Route path={AppRoutes.WONEN} />
              <Route path={AppRoutes.BELASTINGEN} />
              <Route path={AppRoutes.GEZONDHEID} />
              <Route path={AppRoutes.INKOMEN} />*/}
            <Route path={AppRoutes.MIJN_UPDATES} component={MijnUpdates} />
            <Route path={AppRoutes.PROFIEL} component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <MainFooter />
      </AppState>
    </BrowserRouter>
  );
}
