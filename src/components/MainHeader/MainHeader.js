import React, { useContext } from 'react';
import { AppRoutes } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import classnames from 'classnames';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';

import styles from './MainHeader.module.scss';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import AppContext from 'App.context';
import { getProfileLabel } from 'hooks/brp-api.hook';

export default function MainHeader() {
  const { location } = useReactRouter();
  const isDashboard = location.pathname === AppRoutes.ROOT;

  const { BRP } = useContext(AppContext);

  return (
    <header className={styles.header}>
      <div
        className={classnames(styles.topBar, { [styles.white]: isDashboard })}
      >
        <Link className={styles.logoLink} to={AppRoutes.ROOT}>
          <AmsterdamLogoLarge className={styles.logo} />
          <h1>Mijn Amsterdam</h1>
        </Link>
        <BetaLabel className={styles.betaLabel} />
      </div>
      {getProfileLabel(BRP && BRP.me)}
      <MainNavBar />
      <MainHeaderHero />
    </header>
  );
}
