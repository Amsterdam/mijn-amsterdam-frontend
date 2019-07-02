import AutoLogoutDialog from 'components/AutoLogoutDialog/AutoLogoutDialog';
import { trackEvent, usePiwik } from 'hooks/piwik.hook';
import usePageChange from 'hooks/pageChange';
import Dashboard from 'pages/Dashboard/Dashboard';
import Inkomen from 'pages/Inkomen/Inkomen';
import InkomenDetail from 'pages/InkomenDetail/InkomenDetail';
import Jeugdhulp from 'pages/Jeugdhulp/Jeugdhulp';
import Landing from 'pages/Landing/Landing';
import MyArea from 'pages/MyArea/MyArea';
import MyTips from 'pages/MyTips/MyTips';
import MyUpdates from 'pages/MyUpdates/MyUpdates';
import Proclaimer from 'pages/Proclaimer/Proclaimer';
import Zorg from 'pages/Zorg/Zorg';
import ZorgDetail from 'pages/ZorgDetail/ZorgDetail';
import React, { useEffect } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import useRouter from 'use-react-router';

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

interface MainAppProps {
  appState: AppStateInterface;
}

function track(event: any) {
  // NOTE: Potentially dangerous because dom traversal could go down to some parent element with a data-track attribute.
  const trackNode = event.target.closest('[data-track]');
  if (trackNode && trackNode.dataset.track) {
    const payload = trackNode.dataset.track;
    if (payload) {
      trackEvent(payload.split(','));
    }
  }
}

function MainApp({ appState: { SESSION, BRP } }: MainAppProps) {
  const { location } = useRouter();

  usePageChange();

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
          <Route path={AppRoutes.JEUGDHULP} component={Jeugdhulp} />
          <Route
            path={`${AppRoutes.BIJSTANDSUITKERING}/:id`}
            component={InkomenDetail}
          />
          <Route
            path={`${AppRoutes.BIJZONDERE_BIJSTAND}/:id`}
            component={InkomenDetail}
          />
          <Route path={AppRoutes.INKOMEN} component={Inkomen} />
          <Route
            path={`${AppRoutes.ZORG_VOORZIENINGEN}/:id`}
            component={ZorgDetail}
          />
          <Route path={AppRoutes.ZORG} component={Zorg} />
          <Route path={AppRoutes.MY_AREA} component={MyArea} />
          <Route path={AppRoutes.PROCLAIMER} component={Proclaimer} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MainFooter />
    </>
  );
}

export default function App() {
  usePiwik();
  useEffect(() => {
    window.addEventListener('click', track);
    return () => window.removeEventListener('click', track);
  }, []);
  return (
    <BrowserRouter>
      <SessionState
        render={session => {
          // If session was previously authenticated we don't want to show the loader again
          if (session.isLoading && session.isPristine) {
            return (
              <p className={styles.PreLoader}>
                Mijn amsterdam wordt geladen...
              </p>
            );
          }
          // Render the main app only if we are authenticated
          return session.isAuthenticated ? (
            <>
              <AppState
                session={session}
                render={appState => <MainApp appState={appState} />}
              />
              <AutoLogoutDialog session={session} />
            </>
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
