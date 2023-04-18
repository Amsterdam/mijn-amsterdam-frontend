import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { FeatureToggle } from '../../../universal/config';
import YiviLogo from '../../assets/images/irma_logo.jpg';
import {
  Heading,
  LinkdInline,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import { LOGIN_URL_YIVI } from '../../config/api';
import { ExternalUrls } from '../../config/app';
import { trackPageView } from '../../hooks';
import styles from './Landing.module.scss';

export default function Landing() {
  const loginButton = useRef(null);

  useEffect(() => {
    trackPageView('Landing Yivi', document.location.pathname + 'landing');
  }, []);

  const [isRedirectingYivi, setRedirectingYivi] = useState(false);
  const isRedirectingAny = isRedirectingYivi;

  return (
    <TextPage>
      <PageHeading className={styles.Heading}>
        Welkom op Mijn Amsterdam
      </PageHeading>
      <PageContent className={styles.LandingContent} id="skip-to-id-AppContent">
        <p>
          Mijn Amsterdam is uw persoonlijke online pagina bij de gemeente
          Amsterdam.
        </p>
        <MaintenanceNotifications
          fromApiDirectly={true}
          page="landingspagina"
        />
        {FeatureToggle.yiviActive && (
          <div
            className={classnames(
              styles.LoginOption,
              styles['LoginOption--yivi']
            )}
          >
            <Heading className={styles.LoginOptionHeading} size="tiny" el="h3">
              Voor particulieren
            </Heading>
            <p>
              <a
                ref={loginButton}
                role="button"
                href={LOGIN_URL_YIVI}
                onClick={() => setRedirectingYivi(true)}
                rel="noopener noreferrer"
                className={classnames(
                  styles.LoginBtn,
                  styles['LoginBtn--yivi'],
                  isRedirectingAny && styles.LoginBtnDisabled
                )}
              >
                <span className={styles.LoginLogoWrap}>
                  <img
                    src={YiviLogo}
                    alt="YIVI logo"
                    className={styles.LoginLogo}
                  />
                </span>
                <span className={styles.LoginButtonText}>
                  {isRedirectingYivi
                    ? 'Bezig met inloggen...'
                    : 'Inloggen met YIVI'}
                </span>
              </a>
            </p>
            <Heading size="tiny" el="h4">
              Hebt u nog geen YIVI? Regel dit dan eerst.
            </Heading>
            <p>
              Ga naar{' '}
              <a rel="noopener noreferrer" href="https://yivi.app">
                YIVI: een nieuwe manier van inloggen
              </a>{' '}
              voor meer informatie.
            </p>
          </div>
        )}

        <Heading size="tiny" el="h4">
          Vragen over Mijn Amsterdam?
        </Heading>
        <p className={styles.FaqInfo}>
          Kijk bij{' '}
          <LinkdInline
            external={true}
            href={ExternalUrls.MIJN_AMSTERDAM_VEELGEVRAAGD}
          >
            veelgestelde vragen over Mijn Amsterdam
          </LinkdInline>
        </p>
      </PageContent>
    </TextPage>
  );
}
