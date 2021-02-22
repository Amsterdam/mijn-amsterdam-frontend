import DigiDLogo from '../../assets/images/digid-logo.svg';
import EherkenningLogo from '../../assets/images/eherkenning-logo.svg';
import IrmaLogo from '../../assets/images/irma_logo.jpg';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { FeatureToggle } from '../../../universal/config';
import {
  Heading,
  LinkdInline,
  PageContent,
  PageHeading,
  TextPage,
  Alert,
  InnerHtml,
} from '../../components';
import {
  LOGIN_URL_DIGID,
  LOGIN_URL_EHERKENNING,
  LOGIN_URL_IRMA,
} from '../../config/api';
import { trackPageView } from '../../hooks';
import styles from './Landing.module.scss';
import { ExternalUrls } from '../../config/app';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { useCmsMaintenanceNotifications } from '../../hooks/api/useCmsMaintenanceNotifications';

export default function Landing() {
  const loginButton = useRef(null);

  useEffect(() => {
    trackPageView(
      'Landingspagina',
      document.location.pathname + '/landingspagina'
    );
  }, []);

  const maintenanceNotifications = useCmsMaintenanceNotifications(
    'landingspagina'
  );

  const [isRedirecting, setRedirecting] = useState(false);
  const [isRedirectingEherkenning, setRedirectingEherkenning] = useState(false);
  const [isRedirectingIrma, setRedirectingIrma] = useState(false);

  const isRedirectingAny =
    isRedirecting || isRedirectingEherkenning || isRedirectingIrma;

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
        {!!maintenanceNotifications?.length &&
          maintenanceNotifications.map((notification) => {
            return (
              <Alert type="warning">
                <InnerHtml>{notification.description}</InnerHtml>
              </Alert>
            );
          })}

        <div className={styles.LoginOption}>
          {FeatureToggle.eherkenningActive && (
            <Heading className={styles.LoginOptionHeading} size="tiny" el="h3">
              Voor particulieren en eenmanszaken
            </Heading>
          )}
          <p>
            <a
              ref={loginButton}
              role="button"
              href={LOGIN_URL_DIGID}
              onClick={() => setRedirecting(true)}
              rel="noopener noreferrer"
              className={classnames(
                styles.LoginBtn,
                isRedirectingAny && styles.LoginBtnDisabled
              )}
            >
              <span className={styles.LoginLogoWrap}>
                <img
                  src={DigiDLogo}
                  alt="DigiD logo"
                  className={styles.LoginLogo}
                />
              </span>
              <span className={styles.LoginButtonText}>
                {isRedirecting ? 'Bezig met inloggen...' : 'Inloggen met DigiD'}
              </span>
            </a>
          </p>
          <Heading size="tiny" el="h4">
            Hebt u nog geen DigiD? Regel dit dan eerst.
          </Heading>
          <p>
            Ga naar{' '}
            <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen">
              DigiD aanvragen
            </a>
          </p>
        </div>
        {FeatureToggle.irmaActive && (
          <div
            className={classnames(
              styles.LoginOption,
              styles['LoginOption--irma']
            )}
          >
            <Heading className={styles.LoginOptionHeading} size="tiny" el="h3">
              Voor particulieren
            </Heading>
            <p>
              <a
                ref={loginButton}
                role="button"
                href={LOGIN_URL_IRMA}
                onClick={() => setRedirectingIrma(true)}
                rel="noopener noreferrer"
                className={classnames(
                  styles.LoginBtn,
                  styles['LoginBtn--irma'],
                  isRedirectingAny && styles.LoginBtnDisabled
                )}
              >
                <span className={styles.LoginLogoWrap}>
                  <img
                    src={IrmaLogo}
                    alt="IRMA logo"
                    className={styles.LoginLogo}
                  />
                </span>
                <span className={styles.LoginButtonText}>
                  {isRedirectingIrma
                    ? 'Bezig met inloggen...'
                    : 'Inloggen met IRMA'}
                </span>
              </a>
            </p>
            <Heading size="tiny" el="h4">
              Hebt u nog geen IRMA? Regel dit dan eerst.
            </Heading>
            <p>
              Ga naar{' '}
              <a rel="noopener noreferrer" href="https://irma.app">
                IRMA: een nieuwe manier van inloggen
              </a>{' '}
              voor meer informatie.
            </p>
          </div>
        )}
        {FeatureToggle.eherkenningActive && (
          <div
            className={classnames(
              styles.LoginOption,
              styles['LoginOption--eherkenning']
            )}
          >
            <Heading className={styles.LoginOptionHeading} size="tiny" el="h3">
              Voor ondernemers
            </Heading>
            <p>
              <a
                ref={loginButton}
                role="button"
                href={LOGIN_URL_EHERKENNING}
                onClick={() => setRedirectingEherkenning(true)}
                rel="noopener noreferrer"
                className={classnames(
                  styles.LoginBtn,
                  styles['LoginBtn--eherkenning'],
                  isRedirectingAny && styles.LoginBtnDisabled
                )}
              >
                <span className={styles.LoginLogoWrap}>
                  <img
                    src={EherkenningLogo}
                    alt="eHerkenning logo"
                    className={styles.LoginLogo}
                  />
                </span>
                <span className={styles.LoginButtonText}>
                  {isRedirectingEherkenning
                    ? 'Bezig met inloggen...'
                    : 'Inloggen met EHerkenning'}
                </span>
              </a>
            </p>
            <Heading size="tiny" el="h4">
              U hebt EHerkenning niveau {IS_PRODUCTION ? '2+' : '3'} nodig om in
              te loggen.
            </Heading>
            <p>
              Ga naar{' '}
              <a rel="noopener noreferrer" href="https://eherkenning.nl">
                eherkenning.nl
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
