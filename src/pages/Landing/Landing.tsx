import { LOGIN_URL } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import DigiDLogo from 'assets/images/digid-logo.png';
import Heading from 'components/Heading/Heading';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import useDocumentTitle from 'hooks/documentTitle.hook';
import React, { useEffect, useRef, useState } from 'react';

import styles from './Landing.module.scss';
import { PageTitleLanding } from 'hooks/pageChange';
import { trackItemPresentation, itemClickPayload } from 'hooks/analytics.hook';
import classnames from 'classnames';

const CATEGORY = 'MA_Landingspagina';
const DIGID_LOGIN_BUTTON = 'DigiD_login_button';

export default () => {
  // NOTE: Custom title because this page is rendered outside of the <Router />
  useDocumentTitle(PageTitleLanding);

  const loginButton = useRef(null);

  useEffect(() => {
    if (loginButton.current) {
      trackItemPresentation(CATEGORY, DIGID_LOGIN_BUTTON);
    }
  }, []);

  const [isRedirecting, setRedirecting] = useState(false);

  return (
    <PageContentMain>
      <PageContentMainHeading>
        Welkom op Mijn Amsterdam
        <BetaLabel
          role="img"
          aria-label="Beta versie"
          className={styles.BetaLogo}
        />
      </PageContentMainHeading>
      <PageContentMainBody variant="regular" className={styles.Landing}>
        <p>
          Op Mijn Amsterdam ziet u hoe het staat met uw aanvraag of melding. Ook
          ziet u welke gegevens de gemeente van u heeft vastgelegd. Klopt er
          iets niet, dan ziet u waar u terecht kunt om het aan te passen. Nog
          niet alle producten van de gemeente zijn via Mijn Amsterdam
          beschikbaar. De komende jaren komt er steeds meer bij.
        </p>
        <Heading size="medium">Log in op uw persoonlijke pagina</Heading>
        <a
          ref={loginButton}
          role="button"
          href={LOGIN_URL}
          onClick={() => setRedirecting(true)}
          className={classnames(
            styles.LoginBtn,
            isRedirecting && styles.LoginBtnDisabled
          )}
        >
          <img src={DigiDLogo} alt="DigiD logo" className={styles.LoginLogo} />
          <span>
            {isRedirecting
              ? 'U wordt naar de DigID inlogpagina gestuurd..'
              : 'Inloggen met DigiD'}
          </span>
        </a>
        <p>
          <strong>Heeft u nog geen DigiD? Regel dit dan eerst.</strong>
          <br />
          Ga naar <a href="https://www.digid.nl/aanvragen">DigiD aanvragen</a>
        </p>
        <p>
          <strong>
            Op dit moment kunt u deze informatie vinden op Mijn Amsterdam:
          </strong>
        </p>
        <ul>
          <li>Hoe u ingeschreven staat bij de gemeente</li>
          <li>Hoe het staat met uw aanvraag voor een bijstandsuitkering</li>
          <li>Hoe het staat met uw aanvraag voor een Stadspas</li>
          <li>Informatie over uw gemeentebelastingen</li>
          <li>Informatie over uw erfpacht</li>
          <li>Informatie over uw eigen buurt</li>
        </ul>
        <p>
          <strong>Mijn Amsterdam is nog niet af</strong>
          <br />
          De komende jaren komt er steeds meer bij. Laat ons weten wat u ervan
          vindt. U kunt hiervoor de "uw mening" knop gebruiken aan de
          rechterkant van het scherm.
          <br />
        </p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
