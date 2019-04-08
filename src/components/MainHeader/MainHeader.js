import { AppRoutes, ExternalUrls, LOGOUT_URL } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import classnames from 'classnames';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { getProfileLabel } from 'hooks/brp-api.hook';
import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';

import styles from './MainHeader.module.scss';
import {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';

function SecondaryLinks({ me = {}, hasMessages = true }) {
  return (
    <nav className={styles.secondaryLinks}>
      <ButtonLinkExternal
        to={ExternalUrls.BERICHTENBOX}
        className={classnames(hasMessages && 'has-messages')}
      >
        Berichtenbox
      </ButtonLinkExternal>
      {me && me.voornamen && (
        <Link to={AppRoutes.PROFILE}>{getProfileLabel(me)}</Link>
      )}
      {
        <IconButtonLink external={true} target="_self" to={LOGOUT_URL}>
          <LogoutIcon /> Uitloggen
        </IconButtonLink>
      }
    </nav>
  );
}

export default function MainHeader({ me, isAuthenticated }) {
  return (
    <header className={styles.header}>
      <div className={classnames(styles.topBar)}>
        <span className={styles.logoLink}>
          <AmsterdamLogoLarge
            role="img"
            aria-label="Amsterdam logo"
            className={styles.logo}
          />
          <Heading size="large" el="h1">
            <Link className={styles.logoLink} to={AppRoutes.ROOT}>
              Mijn Amsterdam
            </Link>
          </Heading>
        </span>
        <BetaLabel
          role="img"
          aria-label="Beta versie"
          className={styles.betaLabel}
        />
      </div>
      {isAuthenticated && (
        <>
          <MainNavBar />
          <SecondaryLinks me={me} />
        </>
      )}
      <MainHeaderHero />
    </header>
  );
}
