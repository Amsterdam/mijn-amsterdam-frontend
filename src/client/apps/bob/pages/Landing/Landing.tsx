import { useRef, useState } from 'react';

import {
  ActionGroup,
  Column,
  Heading,
  Link,
  Paragraph,
} from '@amsterdam/design-system-react';
import classnames from 'classnames';

import { FeatureToggle } from '../../../../../universal/config/feature-toggles.ts';
import { LogoDigiD } from '../../../../assets/images/LogoDigiD.tsx';
import { LogoEherkenning } from '../../../../assets/images/LogoEherkenning.tsx';
import { MaintenanceNotifications } from '../../../../components/MaintenanceNotifications/MaintenanceNotifications.tsx';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import {
  LOGIN_URL_DIGID,
  LOGIN_URL_DIGID_GEMACHTIGD,
  LOGIN_URL_EHERKENNING,
} from '../../config/api.ts';
import styles from './Landing.module.scss';
import { DASHBOARD_PAGE_DOCUMENT_TITLE } from './Landing-routes.ts';

export function LandingPage() {
  useHTMLDocumentTitle({
    documentTitle: DASHBOARD_PAGE_DOCUMENT_TITLE,
  });

  const loginButton = useRef(null);
  const [isRedirecting, setRedirecting] = useState(false);
  const [isRedirectingEherkenning, setRedirectingEherkenning] = useState(false);
  const isRedirectingAny = isRedirecting || isRedirectingEherkenning;

  return (
    <PageV2
      className={styles.LandingPageContent}
      heading="Welkom op Mijn Amsterdam"
      showBreadcrumbs={false}
    >
      <PageContentCell>
        <Paragraph className="ams-mb-m">
          Uw Amsterdamse zaken op 1 plek.
        </Paragraph>
        <MaintenanceNotifications
          fromApiDirectly={true}
          page="landingspagina"
          className="ams-mb-m"
        />

        {FeatureToggle.eherkenningActive && (
          <Heading className="ams-mb-s" level={2}>
            Voor particulieren en eenmanszaken
          </Heading>
        )}
        <ActionGroup className="ams-mb-l">
          <Column>
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
            <Paragraph>
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
          </Column>
          <Column>
            <a
              ref={loginButton}
              role="button"
              href={LOGIN_URL_DIGID_GEMACHTIGD}
              onClick={() => setRedirecting(true)}
              rel="noopener noreferrer"
              className={classnames(
                styles.LoginBtn,
                styles['LoginBtn--digidGemachtigd'],
                isRedirectingAny && styles.LoginBtnDisabled
              )}
            >
              <span className={styles.LoginLogoWrap}>
                <LogoDigiD />
              </span>
              <span className={styles.LoginButtonText}>
                {isRedirecting
                  ? 'Bezig met inloggen...'
                  : 'Inloggen met DigiD als gemachtigde'}
              </span>
            </a>
            <Paragraph>
              U kunt namens iemand anders inloggen. Vraag hiervoor een
              machtiging aan.
              <br />
              Ga naar{' '}
              <Link
                rel="noopener noreferrer"
                href="https://www.amsterdam.nl/parkeren/test-digid-machtigen/"
              >
                DigiD Machtigen.
              </Link>
            </Paragraph>
          </Column>
        </ActionGroup>

        {FeatureToggle.eherkenningActive && (
          <>
            <Heading className="ams-mb-s" level={2}>
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

        <Heading level={3}>Vragen over Mijn Amsterdam?</Heading>
        <Paragraph>
          Kijk bij{' '}
          <Link
            rel="noopener noreferrer"
            href="https://www.amsterdam.nl/veelgevraagd/mijn-amsterdam-b5077"
          >
            veelgestelde vragen over Mijn Amsterdam
          </Link>
        </Paragraph>
      </PageContentCell>
    </PageV2>
  );
}
