import classnames from 'classnames';
import { useRef, useState } from 'react';
import { FeatureToggle } from '../../../universal/config';
import DigiDLogo from '../../assets/images/LogoDigiD';
import LogoEherkenning from '../../assets/images/LogoEherkenning';
import {
  Heading,
  LinkdInline,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import { LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING } from '../../config/api';
import { ExternalUrls } from '../../config/app';
import styles from './Landing.module.scss';

export default function Landing() {
  const loginButton = useRef(null);
  const [isRedirecting, setRedirecting] = useState(false);
  const [isRedirectingEherkenning, setRedirectingEherkenning] = useState(false);

  const isRedirectingAny = isRedirecting || isRedirectingEherkenning;

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
                <DigiDLogo />
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
                  <LogoEherkenning />
                </span>
                <span className={styles.LoginButtonText}>
                  {isRedirectingEherkenning
                    ? 'Bezig met inloggen...'
                    : 'Inloggen met eHerkenning'}
                </span>
              </a>
            </p>
            <Heading size="tiny" el="h4">
              U hebt eHerkenning niveau 3 nodig om in te loggen.
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
