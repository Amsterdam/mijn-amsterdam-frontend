import { Heading } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { AppRoutes } from '../../../universal/config/routes';
import AmsterdamLogoLarge from '../../assets/images/logo-amsterdam-large.svg?react';
import AmsterdamLogo from '../../assets/images/logo-amsterdam.svg?react';
import { LinkdInline } from '../../components';
import footerStyles from '../../components/MainFooter/MainFooter.module.scss';
import { PageContent, TextPage } from '../../components/Page/Page';
import PageHeading from '../../components/PageHeading/PageHeading';
import { ExternalUrls } from '../../config/external-urls';
import { useDesktopScreen } from '../../hooks/media.hook';
import { useUsabilla } from '../../hooks/useUsabilla';
import styles from './ApplicationError.module.scss';

const LANDSCAPE_SCREEN_RATIO = 0.25;
const PORTRAIT_SCREEN_RATIO = 0.4;

function imgUrl(
  imageName: string,
  width: number,
  orientation: 'landscape' | 'portrait' = 'landscape',
  pixelDensity: number = 1,
  dir = '',
  ext = 'webp'
) {
  const ratio =
    orientation === 'portrait' ? PORTRAIT_SCREEN_RATIO : LANDSCAPE_SCREEN_RATIO;
  return `/header${dir}/${Math.round(pixelDensity * width)}x${Math.round(
    pixelDensity * (width * ratio)
  )}-${imageName}.${ext}`;
}

const srcSet = {
  FALLBACK: imgUrl('algemeen', 1600, 'landscape', 1, '', 'jpg'),
};

export default function ApplicationError({ error }: FallbackProps) {
  useUsabilla();

  const location = window.location;
  const isLargeScreen = useDesktopScreen();
  const Logo = isLargeScreen ? AmsterdamLogoLarge : AmsterdamLogo;

  const containerRole = isLargeScreen ? 'row' : undefined;
  const titleRole = isLargeScreen ? 'columnheader' : 'button';
  const [isOpen, toggleOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <span className={styles.logoLink}>
            <a
              href="https://www.amsterdam.nl"
              rel="external noreferrer noopener"
            >
              <Logo
                role="img"
                aria-label="Gemeente Amsterdam logo"
                className={styles.logo}
              />
            </a>
            {location.pathname !== AppRoutes.ROOT ? (
              <Heading size="level-2" level={1}>
                <a href={AppRoutes.ROOT} title="Terug naar home">
                  Mijn Amsterdam
                </a>
              </Heading>
            ) : (
              <Heading size="level-2" level={1}>
                Mijn Amsterdam
              </Heading>
            )}
          </span>
        </div>

        <div className={classNames(styles.MainHeaderHero)}>
          <img src={srcSet.FALLBACK} className={styles.Image} alt="" />
        </div>
      </header>
      <TextPage className={styles.Page}>
        <PageHeading>Kritieke applicatie fout</PageHeading>
        <PageContent>
          <p>
            Excuses, er gaat iets mis. Probeer om de pagina opnieuw te laden.
            Lukt het dan nog niet? Probeer het dan later nog eens.
          </p>
          <p>
            Gebruikt u Google Translate?
            <br />
            Deze browser extensie veroorzaakt soms problemen, mogelijk werkt de
            pagina beter wanneer u deze extensie niet gebruikt.
          </p>
          <p>
            Als het probleem zich blijft voordoen maak melding bij “Uw mening”
            aan de rechter zijkant van deze pagina.
          </p>
          {error && (
            <p>
              <strong>Fout:</strong> {error.toString()}
            </p>
          )}
          <Heading size="level-4" level={4}>
            Vragen over Mijn Amsterdam?
          </Heading>
          <p>
            Kijk bij
            <LinkdInline
              external={true}
              href={ExternalUrls.MIJN_AMSTERDAM_VEELGEVRAAGD}
            >
              veelgestelde vragen over Mijn Amsterdam
            </LinkdInline>
          </p>
        </PageContent>
      </TextPage>
      <footer className={footerStyles.MainFooter} id="skip-to-id-MainFooter">
        <div
          className={classNames(
            footerStyles.TopBar,
            footerStyles.InnerContainer
          )}
        >
          <div className={footerStyles.InnerContainer}>
            <div
              className={classNames(
                footerStyles.Panel,
                isOpen && footerStyles.PanelOpen
              )}
              role={containerRole}
            >
              <h3
                role={titleRole}
                onClick={() => toggleOpen((isOpen) => !isOpen)}
              >
                Contact
              </h3>
              <div>
                <p>
                  Hebt u een vraag en kunt u het antwoord niet vinden op deze
                  website? Neem dan contact met ons op.
                </p>
                <ul>
                  <li>
                    <a href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx">
                      Contactformulier
                    </a>
                  </li>
                  <li>
                    <strong>
                      Bel het telefoonnummer <a href="tel:14020">14 020</a>
                    </strong>
                    maandag tot en met vrijdag van 08.00 tot 18.00 uur
                  </li>
                  <li>
                    <a href="https://www.amsterdam.nl/contact/">
                      Contactgegevens en openingstijden
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={footerStyles.BottomBar}>
          <div className={footerStyles.InnerContainer}></div>
        </div>
      </footer>
    </>
  );
}
