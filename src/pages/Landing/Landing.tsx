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
          ziet u welke gegevens de gemeente van u heeft vastgelegd. En hoe u
          het kunt doorgeven als er iets niet klopt. Nog niet al uw informatie is
          via Mijn Amsterdam beschikbaar. De komende jaren komt er steeds meer
          bij.
        </p>
        <p>
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
            <img
              src={DigiDLogo}
              alt="DigiD logo"
              className={styles.LoginLogo}
            />
            <span>
              {isRedirecting ? 'Bezig met inloggen...' : 'Inloggen met DigiD'}
            </span>
          </a>
        </p>
        <p>
          <strong>Nog geen DigiD?</strong>
          <br />
          <a href="https://www.digid.nl/aanvragen">Vraag DigiD aan</a>
        </p>
        <p>
          <strong>Dit staat nu op Mijn Amsterdam:</strong>
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
