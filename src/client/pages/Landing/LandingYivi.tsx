import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
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
import { ReactComponent as YiviLogo } from './yivi-logo.svg';
import { AppRoutes } from '../../../universal/config';

export default function Landing() {
  const loginButton = useRef(null);

  useEffect(() => {
    trackPageView('Landing Yivi', document.location.pathname + 'landing');
  }, []);

  const [isRedirectingYivi, setRedirectingYivi] = useState(false);
  const isRedirectingAny = isRedirectingYivi;

  return (
    <TextPage>
      <PageHeading className={styles.Heading}>Inloggen met Yivi</PageHeading>
      <PageContent className={styles.LandingContent} id="skip-to-id-AppContent">
        <p>
          De gemeente Amsterdam vindt het belangrijk dat u veilig en eenvoudig
          online alles kunt regelen met de gemeente en dat u inzicht heeft welke
          persoonsgegevens u uitwisselt en met wie. Dit kunt u doen met Yivi.
        </p>
        <p>
          Gemeente Amsterdam doet een proef met Yivi. Kijk voor meer informatie
          over de proef en Yivi bij{' '}
          <LinkdInline href={AppRoutes.YIVI_INFO}>
            Melding openbare ruimte volgen via Mijn Amsterdam.
          </LinkdInline>
        </p>
        <MaintenanceNotifications fromApiDirectly={true} page="yivisignalen" />

        <div
          className={classnames(
            styles.LoginOption,
            styles['LoginOption--yivi']
          )}
        >
          <Heading className={styles.LoginOptionHeading} size="large" el="h3">
            Mijn meldingen openbare ruimte bekijken
          </Heading>
          <p>
            U kunt met Yivi inloggen in Mijn Amsterdam en uitsluitend uw
            meldingen openbare ruimte volgen (u deelt uw e-mail).
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
            Login met DigiD voor de volledige versie van{' '}
            <LinkdInline href={process.env.BFF_FRONTEND_URL}>
              Mijn Amsterdam
            </LinkdInline>
            .
          </p>
          <Heading size="medium" el="h4">
            Heeft u nog geen YIVI?
          </Heading>
          <p>
            Heeft u nog geen Yivi?{' '}
            <LinkdInline href="https://yivi.app" external>
              Download Yivi
            </LinkdInline>{' '}
            (gratis), kies een pincode en voer je e-mailadres in als
            beveiliging.
            <br />
            Voeg tenslotte het e-mailadres toe dat u gebruikt heeft bij uw
            melding openbare ruimte. Persoons- en adresgegevens hoeft u niet toe
            te voegen.
          </p>
        </div>

        <Heading size="medium" el="h4">
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
