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
import { trackItemPresentation, itemClickPayload } from 'hooks/piwik.hook';
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
          Op Mijn Amsterdam vindt u een overzicht van uw persoonlijke informatie
          en van zaken die u moet regelen met de gemeente. U kunt ook direct een
          aanvraag indienen om uw informatie te wijzigen. Verder kunt u uw
          aanvragen volgen en krijgt u tips.
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
          <strong>Wilt u hulp bij het inloggen met DigiD?</strong>
          <br />
          Ga naar <a href="https://www.digid.nl">DigiD</a>
          <br />
          Of gebruik de{' '}
          <a href="https://www.digid.nl/over-digid/app">DigiD app</a>
          <br />
          Dan hoeft u geen wachtwoord meer te onthouden.
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
