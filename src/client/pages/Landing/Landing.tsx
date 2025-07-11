import { useRef, useState } from 'react';

import { Heading, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import { DASHBOARD_PAGE_DOCUMENT_TITLE } from './Landing-routes';
import styles from './Landing.module.scss';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { LogoDigiD } from '../../assets/images/LogoDigiD';
import LogoEherkenning from '../../assets/images/LogoEherkenning';
import { MaintenanceNotifications } from '../../components/MaintenanceNotifications/MaintenanceNotifications';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING } from '../../config/api';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';

export function LandingPage() {
  useHTMLDocumentTitle({
    documentTitle: DASHBOARD_PAGE_DOCUMENT_TITLE,
  });

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
        <PageContentCell>
          <Heading level={1} className="ams-mb-m">
            Welkom op Mijn Amsterdam
          </Heading>
          <Paragraph className="ams-mb-m">
            Uw Amsterdamse zaken op 1 plek.
          </Paragraph>
          <MaintenanceNotifications
            fromApiDirectly={true}
            page="landingspagina"
            className="ams-mb-m"
          />

          {FeatureToggle.eherkenningActive && (
            <Heading className="ams-mb-s" level={3}>
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
                styles['LoginBtn--digid'],
                isRedirectingAny && styles.LoginBtnDisabled
              )}
            >
              <span className={styles.LoginLogoWrap}>
                <LogoDigiD />
              </span>
              <span className={styles.LoginButtonText}>
                {isRedirecting ? 'Bezig met inloggen...' : 'Inloggen met DigiD'}
              </span>
            </a>
          </Paragraph>
          <Paragraph className="ams-mb-l">
            Heeft u nog geen DigiD? Regel dit dan eerst.
            <br />
            Ga naar{' '}
            <Link
              rel="noopener noreferrer"
              href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen"
            >
              DigiD aanvragen
            </Link>
          </Paragraph>

          {FeatureToggle.eherkenningActive && (
            <>
              <Heading className="ams-mb-s" level={3}>
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
              <Paragraph className="ams-mb-l">
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
          <Paragraph className="ams-mb-l">
            Kijk bij{' '}
            <Link
              rel="noopener noreferrer"
              href="https://www.amsterdam.nl/veelgevraagd/mijn-amsterdam-b5077"
            >
              veelgestelde vragen over Mijn Amsterdam
            </Link>
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
