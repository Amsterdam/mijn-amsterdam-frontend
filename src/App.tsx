import Belastingen from 'pages/Belastingen/Belastingen';
import Dashboard from 'pages/Dashboard/Dashboard';
import Inkomen from 'pages/Inkomen/Inkomen';
import InkomenDetail from 'pages/InkomenDetail/InkomenDetail';
import Jeugdhulp from 'pages/Jeugdhulp/Jeugdhulp';
import Landing from 'pages/Landing/Landing';
import MyArea from 'pages/MyArea/MyArea';
import MyTips from 'pages/MyTips/MyTips';
import MyUpdates from 'pages/MyUpdates/MyUpdates';
import Wonen from 'pages/Wonen/Wonen';
import Zorg from 'pages/Zorg/Zorg';
import ZorgDetail from 'pages/ZorgDetail/ZorgDetail';
import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import useReactRouter from 'use-react-router';

import { AppRoutes } from './App.constants';
import styles from './App.module.scss';
import AppState, {
  AppState as AppStateInterface,
  SessionState,
} from './AppState';
import MainFooter from './components/MainFooter/MainFooter';
import MainHeader from './components/MainHeader/MainHeader';
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';
import Privacy from 'pages/Privacy/Privacy';

interface MainAppProps {
  appState: AppStateInterface;
}

function MainApp({ appState: { SESSION, BRP } }: MainAppProps) {
  const { location } = useReactRouter();

  return location.pathname === AppRoutes.MY_AREA ? (
    <MyArea />
  ) : (
    <>
      <MainHeader
        person={BRP.person}
        isAuthenticated={SESSION.isAuthenticated}
      />
      <div className={styles.App}>
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Redirect from={AppRoutes.API_LOGIN} to={AppRoutes.ROOT} />
          <Route path={AppRoutes.MY_UPDATES} component={MyUpdates} />
          <Route path={AppRoutes.PROFILE} component={Profile} />
          <Route path={AppRoutes.MY_TIPS} component={MyTips} />
          <Route path={`${AppRoutes.STADSPAS}/:id`} component={InkomenDetail} />
          <Route path={AppRoutes.BELASTINGEN} component={Belastingen} />
          <Route path={AppRoutes.JEUGDHULP} component={Jeugdhulp} />
          <Route path={AppRoutes.WONEN} component={Wonen} />
          <Route
            path={`${AppRoutes.BIJSTANDSUITKERING}/:id`}
            component={InkomenDetail}
          />
          <Route
            path={`${AppRoutes.BIJZONDERE_BIJSTAND}/:id`}
            component={InkomenDetail}
          />
          <Route path={AppRoutes.INKOMEN} component={Inkomen} />
          <Route path={`${AppRoutes.ZORG}/:id`} component={ZorgDetail} />
          <Route path={AppRoutes.ZORG} component={Zorg} />
          <Route path={AppRoutes.MY_AREA} component={MyArea} />
          <Route path={AppRoutes.PRIVACY} component={Privacy} />
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
            return (
              <p className={styles.PreLoader}>
                Mijn amsterdam wordt geladen...
              </p>
            );
          }
          // Render the main app only if we are authenticated
          return session.isAuthenticated ? (
            <AppState
              session={session}
              render={appState => <MainApp appState={appState} />}
            />
          ) : (
            <div className={styles.NotYetAuthenticated}>
              <MainHeader />
              <Landing />
              <MainFooter />
            </div>
          );
        }}
      />
    </BrowserRouter>
  );
}
