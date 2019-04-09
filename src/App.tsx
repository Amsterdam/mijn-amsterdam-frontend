import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AppState from './AppState';
import { AppRoutes } from './App.constants';
import MainHeader from './components/MainHeader/MainHeader';
import MainFooter from './components/MainFooter/MainFooter';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import styles from './App.module.scss';
import Landing from 'pages/Landing/Landing';
import MyUpdates from 'pages/MyUpdates/MyUpdates';
import MyTips from 'pages/MyTips/MyTips';
import Burgerzaken from 'pages/Burgerzaken/Burgerzaken';
import Belastingen from 'pages/Belastingen/Belastingen';
import Jeugdhulp from 'pages/Jeugdhulp/Jeugdhulp';
import Wonen from 'pages/Wonen/Wonen';
import Inkomen from 'pages/Inkomen/Inkomen';
import Zorg from 'pages/Zorg/Zorg';

export default function App() {
  return (
    <BrowserRouter>
      <AppState>
        <MainHeader />
        <div className={styles.App}>
          <Switch>
            <Route exact path={AppRoutes.ROOT} component={Landing} />
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
      </AppState>
    </BrowserRouter>
  );
}
