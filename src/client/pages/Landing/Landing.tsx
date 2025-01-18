import { useRef, useState } from 'react';

import { Heading, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './Landing.module.scss';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import DigiDLogo from '../../assets/images/LogoDigiD';
import LogoEherkenning from '../../assets/images/LogoEherkenning';
import { MaintenanceNotifications } from '../../components';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING } from '../../config/api';
import { ExternalUrls } from '../../config/app';

export default function Landing() {
  const loginButton = useRef(null);
  const [isRedirecting, setRedirecting] = useState(false);
  const [isRedirectingEherkenning, setRedirectingEherkenning] = useState(false);
  const isRedirectingAny = isRedirecting || isRedirectingEherkenning;

  return (
    <TextPageV2>
      <PageContentV2
        id="skip-to-id-AppContent"
        className={styles.LandingPageContent}
      >
        <PageContentCell startWide={3}>
          <Heading level={1} className="ams-mb--sm">
            Welkom op Mijn Amsterdam
          </Heading>
          <Paragraph className="ams-mb--md">
            Uw Amsterdamse zaken op 1 plek.
          </Paragraph>
          <MaintenanceNotifications
            fromApiDirectly={true}
            page="landingspagina"
          />

          {FeatureToggle.eherkenningActive && (
            <Heading className="ams-mb--xs" level={3}>
              Voor particulieren en eenmanszaken
            </Heading>
          )}
          <Paragraph>
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
          </Paragraph>
          <Paragraph className="ams-mb--md">
            Hebt u nog geen DigiD? Regel dit dan eerst.
            <br />
            Ga naar{' '}
            <Link rel="noopener noreferrer" href={ExternalUrls.DIGID_AANVRAGEN}>
              DigiD aanvragen
            </Link>
          </Paragraph>

          {FeatureToggle.eherkenningActive && (
            <>
              <Heading className="ams-mb--xs" level={3}>
                Voor ondernemers
              </Heading>
              <Paragraph>
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
                  <span
                    className={classnames(
                      styles.LoginLogoWrap,
                      styles.LogoEherkenning
                    )}
                  >
                    <LogoEherkenning />
                  </span>
                  <span className={styles.LoginButtonText}>
                    {isRedirectingEherkenning
                      ? 'Bezig met inloggen...'
                      : 'Inloggen met eHerkenning'}
                  </span>
                </a>
              </Paragraph>
              <Paragraph className="ams-mb--md">
                U heeft eHerkenning niveau 3 nodig om in te loggen.
                <br />
                Ga naar{' '}
                <Link rel="noopener noreferrer" href="https://eherkenning.nl">
                  eherkenning.nl
                </Link>{' '}
                voor meer informatie.
              </Paragraph>
            </>
          )}

          <Heading level={4}>Vragen over Mijn Amsterdam?</Heading>
          <Paragraph className="ams-mb--md">
            Kijk bij{' '}
            <Link
              rel="noopener noreferrer"
              href={ExternalUrls.MIJN_AMSTERDAM_VEELGEVRAAGD}
            >
              veelgestelde vragen over Mijn Amsterdam
            </Link>
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
