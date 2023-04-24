import classnames from 'classnames';
import { useRef, useState } from 'react';
import {
  Heading,
  LinkdInline,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import { LOGIN_URL_YIVI } from '../../config/api';
import styles from './Landing.module.scss';
import { ReactComponent as YiviLogo } from './yivi-logo.svg';

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
        <p>
          U heeft een melding openbare ruimte gedaan. En u wilt weten wat er met
          uw melding gebeurt. In Mijn Amsterdam kunt u uw melding bekijken. Dit
          is een proef van de gemeente Amsterdam.
        </p>
        <MaintenanceNotifications fromApiDirectly={true} page="yivisignalen" />
        <div
          className={classnames(
            styles.LoginOption,
            styles['LoginOption--yivi']
          )}
        >
          <Heading className={styles.LoginOptionHeading} size="large" el="h3">
            Inloggen met Yivi
          </Heading>
          <p>
            Wij maken voor deze proef gebruik van de app Yivi. U kunt met Yivi
            inloggen zonder onnodige gegevens met ons te delen. Het enige dat
            nodig is, is het e-mailadres dat u heeft opgegeven bij het doen van
            de melding.
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
                  : 'Inloggen met YIVI'}
              </span>
            </a>
          </p>
          <p>
            Kijk voor meer informatie over de proef en Yivi bij{' '}
            <LinkdInline
              external
              href="https://www.amsterdam.nl/veelgevraagd/?caseid=%7Bfbeab9ad-81e4-4fee-9dfc-3fd62eb92719%7D"
            >
              Melding openbare ruimte volgen
            </LinkdInline>
            .
          </p>
          <p>
            Login met DigiD voor de volledige versie van{' '}
            <LinkdInline external href={process.env.BFF_FRONTEND_URL}>
              Mijn Amsterdam
            </LinkdInline>
            .
          </p>
          <Heading size="medium" el="h4">
            Download Yivi
          </Heading>
          <p>
            <LinkdInline href="https://www.yivi.app/download" external>
              Download gratis de Yivi-app
            </LinkdInline>
          </p>
        </div>

        <Heading size="medium" el="h4">
          Vragen over Mijn Amsterdam?
        </Heading>
        <p className={styles.FaqInfo}>
          Kijk bij{' '}
          <LinkdInline
            external
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7B68422ECA-8C56-43EC-A9AA-B3DF190B5077%7D"
          >
            veelgestelde vragen over Mijn Amsterdam
          </LinkdInline>
        </p>
      </PageContent>
    </TextPage>
  );
}
