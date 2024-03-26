import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { useRef, useState } from 'react';
import {
  ErrorAlert,
  LinkdInline,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import { LOGIN_URL_YIVI } from '../../config/api';
import { FeatureToggle } from '../../../universal/config';
import styles from './Landing.module.scss';
import { default as YiviLogo } from './yivi-logo.svg?react';

export default function Landing() {
  const loginButton = useRef(null);
  const [isRedirectingYivi, setRedirectingYivi] = useState(false);
  const isRedirectingAny = isRedirectingYivi;

  return (
    <TextPage>
      <PageHeading className={styles.Heading}>
        Melding openbare ruimte volgen
      </PageHeading>
      <PageContent className={styles.LandingContent} id="skip-to-id-AppContent">
        {!FeatureToggle.yiviActive && (
          <ErrorAlert>

              Vanaf 22 mei kon u online uw meldingen openbare ruimte volgen via
              de app Yivi. Deze proef liep tot eind augustus. We danken iedereen
              voor deelname aan de proef.



              U kunt online uw melding nu via 'Mijn meldingen' volgen. Ga
              hiervoor naar{' '}
              <a
                href="http://meldingen.amsterdam.nl/mijn-meldingen"
                rel="noopener noreferrer"
              >
                uw meldingenoverzicht
              </a>
              .

          </ErrorAlert>
        )}
        {FeatureToggle.yiviActive && (
          <>
            <p>
              U heeft een melding openbare ruimte gedaan. En u wilt weten wat er
              met uw melding gebeurt. In Mijn Amsterdam kunt u uw melding
              bekijken. Dit is een proef van de gemeente Amsterdam.
            </p>
            <MaintenanceNotifications
              fromApiDirectly={true}
              page="yivisignalen"
            />
            <div
              className={classnames(
                styles.LoginOption,
                styles['LoginOption--yivi']
              )}
            >
              <Heading
                className={styles.LoginOptionHeading}
                size="level-3"
                level={3}
              >
                Inloggen met Yivi
              </Heading>
              <p>
                Wij maken voor deze proef gebruik van de app Yivi. U kunt met
                Yivi inloggen zonder onnodige gegevens met ons te delen. Het
                enige dat nodig is, is het e-mailadres dat u heeft opgegeven bij
                het doen van de melding.
              </p>
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
                  <span className={styles.YiviLogoWrap}>
                    <YiviLogo />
                  </span>
                  <span className={styles.LoginButtonText}>
                    {isRedirectingYivi
                      ? 'Bezig met inloggen...'
                      : 'Inloggen met Yivi'}
                  </span>
                </a>
              </p>
              <p>
                Kijk voor meer informatie over de proef en Yivi bij{' '}
                <LinkdInline
                  external
                  href="https://www.amsterdam.nl/veelgevraagd/melding-openbare-ruimte-online-volgen-92719-kp"
                >
                  Melding openbare ruimte volgen
                </LinkdInline>
                .
              </p>
              <Heading size="level-3" level={4}>
                Download Yivi
              </Heading>
              <p>
                <LinkdInline href="https://www.yivi.app/download" external>
                  Download gratis de Yivi-app
                </LinkdInline>
              </p>
            </div>
          </>
        )}
      </PageContent>
    </TextPage>
  );
}
