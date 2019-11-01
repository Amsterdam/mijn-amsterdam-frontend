import { LOGIN_URL, ExternalUrls } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import DigiDLogo from 'assets/images/digid-logo.png';
import Heading from 'components/Heading/Heading';
import Page, { TextPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import React, { useEffect, useRef, useState } from 'react';

import styles from './Landing.module.scss';
import { trackPageView } from 'hooks/analytics.hook';
import classnames from 'classnames';
import { clearSessionStorage } from 'hooks/storage.hook';
import { LinkdInline } from 'components/Button/Button';

export default () => {
  const loginButton = useRef(null);

  useEffect(() => {
    trackPageView('Landingspagina', document.location.href + 'landingspagina');
    // Whenever we load the landing/login page, start a new session.
    clearSessionStorage();
  }, []);

  const [isRedirecting, setRedirecting] = useState(false);

  return (
    <TextPage>
      <PageHeading className={styles.Heading}>
        Welkom op Mijn Amsterdam
        <BetaLabel
          aria-hidden="true"
          role="img"
          aria-label="Beta versie"
          className={styles.BetaLogo}
        />
      </PageHeading>
      <PageContent id="AppContent">
        <p>
          Welkom op Mijn Amsterdam: uw persoonlijke digitale pagina bij de
          gemeente Amsterdam. Hier ziet u op één centrale plek welke gegevens de
          gemeente van u heeft vastgelegd. En ziet u ook welke producten en
          diensten u heeft bij de gemeente. Wat de status is en hoe u het kunt
          doorgeven als er iets niet klopt.
        </p>
        <p>
          Nog niet al uw informatie is via Mijn Amsterdam zichtbaar. We
          ontwikkelen stap voor stap. Er komen er steeds meer producten en
          diensten bij.
        </p>
        <Heading size="mediumLarge" el="h2">
          Log in op uw persoonlijke pagina
        </Heading>
        <p>
          <a
            ref={loginButton}
            role="button"
            href={LOGIN_URL}
            onClick={() => setRedirecting(true)}
            rel="noopener noreferrer"
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
        <Heading size="tiny" el="h3">
          Hebt u nog geen DigiD? Regel dit dan eerst.
        </Heading>
        <p>
          Ga naar <a href="https://www.digid.nl/aanvragen">DigiD aanvragen</a>
        </p>
        <Heading size="tiny" el="h3">
          Op dit moment kunt u deze informatie vinden op Mijn Amsterdam:
        </Heading>
        <ul>
          <li>Hoe u ingeschreven staat bij de gemeente</li>
          <li>Hoe het staat met uw aanvraag voor een bijstandsuitkering</li>
          <li>Uw voorzieningen in het kader van zorg en ondersteuning (Wmo)</li>
          <li>Hoe het staat met uw aanvraag voor een Stadspas</li>
          <li>Informatie over uw gemeentebelastingen</li>
          <li>Informatie over uw erfpacht</li>
          <li>Informatie over uw eigen buurt en rondom uw woning</li>
        </ul>
        <Heading size="tiny" el="h3">
          Vragen over Mijn Amsterdam?
        </Heading>
        <p>
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
};
