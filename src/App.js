import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { AppRoutes } from './App.constants.js';
import MainHeader from './components/MainHeader/MainHeader.js';
import MainFooter from './components/MainFooter/MainFooter.js';
import Dashboard from './pages/Dashboard/Dashboard.js';
import NotFound from './pages/NotFound/NotFound.js';
import styles from './App.module.scss';

import AppContext from './App.context';
import { useBrpApi } from 'hooks/brp-api.hook.js';

export default function App() {
  // State that needs to be available everywhere
  const appState = {
    BRP: useBrpApi(),
  };

  return (
    <BrowserRouter>
      <AppContext.Provider value={appState}>
        <MainHeader />
        <main className={styles.App}>
          <Switch>
            <Route exact path={AppRoutes.ROOT} component={Dashboard} />
            {/* <Route path={AppRoutes.BURGERZAKEN} />
              <Route path={AppRoutes.WONEN} />
              <Route path={AppRoutes.BELASTINGEN} />
              <Route path={AppRoutes.GEZONDHEID} />
              <Route path={AppRoutes.INKOMEN} />
              <Route path={AppRoutes.PROFILE} component={ProfileContainer} /> */}
            <Route component={NotFound} />
          </Switch>
        </main>
        <MainFooter />
      </AppContext.Provider>
    </BrowserRouter>
  );
}
