import { AppRoutes, ExternalUrls, LOGOUT_URL } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import classnames from 'classnames';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';

import styles from './MainHeader.module.scss';
import {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';
import { Person } from 'hooks/api/brp-api.hook';

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
        <Link to={AppRoutes.PROFILE}>{person.fullName}</Link>
      )}
      {
        <IconButtonLink external={true} target="_self" to={LOGOUT_URL}>
          <LogoutIcon /> Uitloggen
        </IconButtonLink>
      }
    </nav>
  );
}

export interface MainHeaderProps {
  person?: Person | null;
  isAuthenticated?: boolean;
}

export default function MainHeader({
  person = null,
  isAuthenticated = false,
}: MainHeaderProps) {
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
      {isAuthenticated && person && (
        <>
          <MainNavBar />
          <SecondaryLinks person={person} />
        </>
      )}
      <MainHeaderHero />
    </header>
  );
}
