import AutoLogoutDialog from 'components/AutoLogoutDialog/AutoLogoutDialog';
import usePageChange from 'hooks/pageChange';
import { trackEvent, useAnalytics } from 'hooks/analytics.hook';
import Dashboard from 'pages/Dashboard/Dashboard';
import Inkomen from 'pages/Inkomen/Inkomen';
import InkomenDetail from 'pages/InkomenDetail/InkomenDetail';
import Jeugdhulp from 'pages/Jeugdhulp/Jeugdhulp';
import LandingPage from 'pages/Landing/Landing';
import MyArea from 'pages/MyArea/MyArea';
import MyTips from 'pages/MyTips/MyTips';
import MyNotifications from 'pages/MyNotifications/MyNotifications';
import Proclaimer from 'pages/Proclaimer/Proclaimer';
import Zorg from 'pages/Zorg/Zorg';
import ZorgDetail from 'pages/ZorgDetail/ZorgDetail';
import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import useRouter from 'use-react-router';

import { AppRoutes } from './App.constants';
import styles from './App.module.scss';
import AppState, { AppContext, SessionContext, SessionState } from './AppState';
import MainFooter from './components/MainFooter/MainFooter';
import MainHeader from './components/MainHeader/MainHeader';
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';

function track(event: any) {
  // NOTE: Beware of potentially nested [data-track] attributes as traversing up the dom here could result in using the wrong data-track attribute on a parent.
  const trackNode = event.target.closest('[data-track]');
  if (trackNode && trackNode.dataset.track) {
    const payload = trackNode.dataset.track;
    if (payload) {
      trackEvent(payload.split(','));
    }
  }
}

function AppAuthenticated() {
  const { location } = useRouter();
  const session = useContext(SessionContext);

  usePageChange();

  return location.pathname === AppRoutes.MY_AREA ? (
    <MyArea />
  ) : (
    <>
      <MainHeader isAuthenticated={session.isAuthenticated} />
      <div className={styles.App} id="AppContent">
        <Switch>
          <Route exact path={AppRoutes.ROOT} component={Dashboard} />
          <Redirect from={AppRoutes.API_LOGIN} to={AppRoutes.ROOT} />
          <Route
            path={AppRoutes.MY_NOTIFICATIONS}
            component={MyNotifications}
          />
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

function AppLanding() {
  const session = useContext(SessionContext);
  const { isPristine, isAuthenticated } = session;
  // If session was previously authenticated we don't want to show the loader again
  if (isPristine) {
    return <p className={styles.PreLoader}>Welkom bij Mijn Amsterdam</p>;
  }
  // Render the main app only if we are authenticated
  return isAuthenticated ? (
    <>
      <AppState>
        <AppAuthenticated />
      </AppState>
      <AutoLogoutDialog />
    </>
  ) : (
    <div className={styles.NotYetAuthenticated}>
      <MainHeader />
      <LandingPage />
      <MainFooter />
    </div>
  );
}

export default function App() {
  // analytics tracking
  useAnalytics();
  useEffect(() => {
    window.addEventListener('click', track);
    return () => window.removeEventListener('click', track);
  }, []);

  return (
    <BrowserRouter>
      <SessionState>
        <AppLanding />
      </SessionState>
    </BrowserRouter>
  );
}
