import { AppRoutes, ExternalUrls } from 'App.constants';
import AppContext from 'App.context';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import classnames from 'classnames';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { getProfileLabel } from 'hooks/brp-api.hook';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';

import styles from './MainHeader.module.scss';
import ButtonLink, {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';

function SecondaryLinks({ me, hasMessages = true }) {
  return (
    <div className={styles.secondaryLinks}>
      <ButtonLinkExternal
        to={ExternalUrls.BERICHTENBOX}
        className={classnames(hasMessages && 'has-messages')}
      >
        Berichtenbox
      </ButtonLinkExternal>
      {me && <Link to={AppRoutes.PROFIEL}>{getProfileLabel(me)}</Link>}
      {
        <IconButtonLink>
          <LogoutIcon /> Uitloggen
        </IconButtonLink>
      }
    </div>
  );
}

export default function MainHeader() {
  const { location } = useReactRouter();
  const isDashboard = location.pathname === AppRoutes.ROOT;
  const {
    BRP,
    SESSION: { isAuthenticated },
  } = useContext(AppContext);

  console.log('auth:', useContext(AppContext));

  return (
    <header className={styles.header}>
      <div
        className={classnames(styles.topBar, {
          [styles.isDashboard]: isDashboard,
        })}
      >
        <Link className={styles.logoLink} to={AppRoutes.ROOT}>
          <AmsterdamLogoLarge className={styles.logo} />
          <h1>Mijn Amsterdam</h1>
        </Link>
        {isAuthenticated && <SecondaryLinks me={BRP.me} />}
        <BetaLabel className={styles.betaLabel} />
      </div>
      <MainNavBar />
      <MainHeaderHero />
    </header>
  );
}
