import { AppRoutes, ExternalUrls, LOGOUT_URL } from 'App.constants';
import { AppContext } from 'AppState';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import classnames from 'classnames';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { getProfileLabel, BrpState, Person } from 'hooks/api/brp-api.hook';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import useReactRouter from 'use-react-router';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';

import styles from './MainHeader.module.scss';
import {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';

interface SecondaryLinksProps {
  person: Person;
  hasMessages?: boolean;
}

function SecondaryLinks({ person, hasMessages = false }: SecondaryLinksProps) {
  return (
    <nav className={styles.secondaryLinks}>
      <ButtonLinkExternal
        to={ExternalUrls.BERICHTENBOX}
        className={classnames(hasMessages && 'has-messages')}
      >
        Berichtenbox
      </ButtonLinkExternal>
      {person && person.firstName && (
        <Link to={AppRoutes.PROFILE}>{getProfileLabel(person)}</Link>
      )}
      {
        <IconButtonLink external={true} target="_self" to={LOGOUT_URL}>
          <LogoutIcon /> Uitloggen
        </IconButtonLink>
      }
    </nav>
  );
}

export default function MainHeader() {
  const { location } = useReactRouter();
  const isDashboard = location.pathname === AppRoutes.ROOT;
  const {
    BRP,
    SESSION: { isAuthenticated },
  } = useContext(AppContext);

  return (
    <header className={styles.header}>
      <div
        className={classnames(styles.topBar, {
          [styles.isDashboard]: isDashboard,
        })}
      >
        <span className={styles.logoLink}>
          <AmsterdamLogoLarge
            role="img"
            aria-label="Amsterdam logo"
            className={styles.logo}
          />
          <Heading size="large" el="h1" className>
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
      <MainNavBar />
      {isAuthenticated && <SecondaryLinks person={BRP.person} />}
      <MainHeaderHero />
    </header>
  );
}
