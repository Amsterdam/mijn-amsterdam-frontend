import { useState } from 'react';

import {
  ActionGroup,
  Column,
  Heading,
  Link,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';
import classnames from 'classnames';

import { FeatureToggle } from '../../../../../universal/config/feature-toggles.ts';
import { LogoDigiD } from '../../../../assets/images/LogoDigiD.tsx';
import { LogoEherkenning } from '../../../../assets/images/LogoEherkenning.tsx';
import { MaintenanceNotifications } from '../../../../components/MaintenanceNotifications/MaintenanceNotifications.tsx';
import { MaButtonLink } from '../../../../components/MaLink/MaLink.tsx';
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
        <Row className="ams-mb-l" align="between">
          <Column>
            <Row gap="small">
              <span className={styles.LoginLogoWrap} aria-hidden="true">
                <LogoDigiD />
              </span>

              <MaButtonLink
                href={LOGIN_URL_DIGID}
                role="button"
                onClick={() => {
                  setRedirecting(true);
                  window.location.href = LOGIN_URL_DIGID;
                }}
                rel="noopener noreferrer"
                variant="primary"
                isDisabled={isRedirectingAny}
              >
                {isRedirecting ? 'Bezig met inloggen...' : 'Inloggen met DigiD'}
              </MaButtonLink>
            </Row>
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
            <Row gap="small">
              <span className={styles.LoginLogoWrap} aria-hidden="true">
                <LogoDigiD />
              </span>
              <MaButtonLink
                href={LOGIN_URL_DIGID_GEMACHTIGD}
                role="button"
                onClick={() => {
                  setRedirecting(true);
                  window.location.href = LOGIN_URL_DIGID_GEMACHTIGD;
                }}
                rel="noopener noreferrer"
                variant="secondary"
                isDisabled={isRedirectingAny}
              >
                {isRedirecting
                  ? 'Bezig met inloggen...'
                  : 'Inloggen als gemachtigde'}
              </MaButtonLink>
            </Row>

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
        </Row>

        {FeatureToggle.eherkenningActive && (
          <>
            <Heading className="ams-mb-s" level={2}>
              Voor ondernemers
            </Heading>
            <Column>
              <Row gap="small">
                <span
                  aria-hidden="true"
                  className={classnames(
                    styles.LoginLogoWrap,
                    styles.LogoEherkenning
                  )}
                >
                  <LogoEherkenning />
                </span>
                <MaButtonLink
                  href={LOGIN_URL_EHERKENNING}
                  role="button"
                  onClick={() => {
                    setRedirectingEherkenning(true);
                    window.location.href = LOGIN_URL_EHERKENNING;
                  }}
                  rel="noopener noreferrer"
                  variant="primary"
                  isDisabled={isRedirectingAny}
                >
                  {isRedirectingEherkenning
                    ? 'Bezig met inloggen...'
                    : 'Inloggen met eHerkenning'}
                </MaButtonLink>
              </Row>
              <Paragraph className="ams-mb-l">
                U heeft eHerkenning niveau 3 nodig om in te loggen.
                <br />
                Ga naar{' '}
                <Link rel="noopener noreferrer" href="https://eherkenning.nl">
                  eherkenning.nl
                </Link>{' '}
                voor meer informatie.
              </Paragraph>
            </Column>
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
