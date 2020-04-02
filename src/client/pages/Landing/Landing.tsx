import { PageContent, TextPage } from '../../components/Page/Page';
import React, { useEffect, useRef, useState } from 'react';

import { ReactComponent as BetaLabel } from '../../assets/images/beta-label.svg';
import DigiDLogo from 'assets/images/digid-logo.svg';
import EherkenningLogo from 'assets/images/eherkenning-logo.svg';
import { ExternalUrls } from '../../config/App.constants';
import Heading from '../../components/Heading/Heading';
import { LOGIN_URL } from '../../config/Api.constants';
import { LinkdInline } from '../../components/Button/Button';
import PageHeading from '../../components/PageHeading/PageHeading';
import classnames from 'classnames';
import { clearSessionStorage } from '../../hooks/storage.hook';
import styles from './Landing.module.scss';
import { trackPageView } from '../../hooks/analytics.hook';
import { FeatureToggle } from '../../config/App.constants';

export default () => {
  const loginButton = useRef(null);

  useEffect(() => {
    trackPageView('Landingspagina', document.location.href + 'landingspagina');
    // Whenever we load the landing/login page, start a new session.
    clearSessionStorage();
  }, []);

  const [isRedirecting, setRedirecting] = useState(false);

  return (
    <TextPage>
      <PageHeading className={styles.Heading}>
        Welkom op Mijn Amsterdam
      </PageHeading>
      <PageContent className={styles.LandingContent} id="AppContent">
        <p>
          Welkom op Mijn Amsterdam: uw persoonlijke online pagina bij de
          gemeente Amsterdam. Hier ziet u op 1 centrale plek welke gegevens de
          gemeente van u heeft vastgelegd. U ziet ook wat u hebt aangevraagd bij
          de gemeente en hoe het met uw aanvraag staat. En hoe u het kunt
          doorgeven als er iets niet klopt.
        </p>
        <p>
          Nog niet al uw informatie is op Mijn Amsterdam zichtbaar. We
          ontwikkelen stap voor stap. Er komt steeds meer bij.
        </p>
        <Heading className={styles.LoginHeading} size="mediumLarge" el="h2">
          Log in op Mijn Amsterdam
        </Heading>

        <div className={styles.LoginOption}>
          <Heading size="tiny" el="h3">
            Voor particulieren
          </Heading>
          <p>
            <a
              ref={loginButton}
              role="button"
              href={LOGIN_URL}
              onClick={() => setRedirecting(true)}
              rel="noopener noreferrer"
              className={classnames(
                styles.LoginBtn,
                isRedirecting && styles.LoginBtnDisabled
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
            Ga naar <a href="https://www.digid.nl/aanvragen">DigiD aanvragen</a>
          </p>
        </div>
        {FeatureToggle.eherkenningActive && (
          <div
            className={classnames(
              styles.LoginOption,
              styles['LoginOption--eherkenning']
            )}
          >
            <Heading size="tiny" el="h3">
              Voor ondernermers
            </Heading>
            <p>
              <a
                ref={loginButton}
                role="button"
                href={LOGIN_EHERKENNING_URL}
                onClick={() => setRedirecting(true)}
                rel="noopener noreferrer"
                className={classnames(
                  styles.LoginBtn,
                  styles['LoginBtn--eherkenning'],
                  isRedirecting && styles.LoginBtnDisabled
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
                  {isRedirecting
                    ? 'Bezig met inloggen...'
                    : 'Inloggen met EHerkenning'}
                </span>
              </a>
            </p>
            <Heading size="tiny" el="h4">
              U heeft EHerkenning niveau 2+ nodig om in te loggen.
            </Heading>
            <p>
              Ga naar <a href="https://eherkenning.nl">eherkenning.nl</a> voor
              meer informatie.
            </p>
          </div>
        )}
        <Heading size="tiny" el="h3">
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
};
