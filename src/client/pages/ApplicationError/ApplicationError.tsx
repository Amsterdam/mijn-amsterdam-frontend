import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FallbackProps } from 'react-error-boundary';
import classNames from 'classnames';
import styles from './ApplicationError.module.scss';
import footerStyles from '../../components/MainFooter/MainFooter.module.scss';
import { AppRoutes, ExternalUrls } from '../../../universal/config';
import { useDesktopScreen } from '../../hooks';
import Heading from '../../components/Heading/Heading';
import { PageContent, TextPage } from '../../components/Page/Page';
import PageHeading from '../../components/PageHeading/PageHeading';
import { ReactComponent as AmsterdamLogoLarge } from '../../assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from '../../assets/images/logo-amsterdam.svg';
import { Linkd, LinkdInline } from '../../components';
import { isExternalUrl } from '../../../universal/helpers';

const LANDSCAPE_SCREEN_RATIO = 0.25;
const PORTRAIT_SCREEN_RATIO = 0.4;

const BOTTOM_LINKS = [
  {
    title: 'Over deze site',
    to: 'https://www.amsterdam.nl/overdezesite/',
  },
  {
    title: 'Privacy',
    to: 'https://www.amsterdam.nl/privacy/',
  },
  {
    title: 'Webarchief',
    to: 'https://amsterdam.archiefweb.eu/',
  },
];

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
  PORTRAIT_SMALL: imgUrl('algemeen', 360, 'portrait', 1, ''),
  PORTRAIT_SMALL_2X: imgUrl('algemeen', 360, 'portrait', 2, ''),
  PORTRAIT_SMALL_3X: imgUrl('algemeen', 360, 'portrait', 3, ''),
  LANDSCAPE_SMALL: imgUrl('algemeen', 1024, 'landscape', 1, ''),
  LANDSCAPE_MEDIUM: imgUrl('algemeen', 1366, 'landscape', 1, ''),
  LANDSCAPE_LARGE: imgUrl('algemeen', 1600, 'landscape', 1, ''),
  FALLBACK: imgUrl('algemeen', 1600, 'landscape', 1, '', 'jpg'),
};

export default function ApplicationError({ error }: FallbackProps) {
  const location = window.location;
  const Logo = useDesktopScreen() ? AmsterdamLogoLarge : AmsterdamLogo;

  const containerRole = useDesktopScreen() ? 'row' : undefined;
  const titleRole = useDesktopScreen() ? 'columnheader' : 'button';
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
              <Heading size="large" el="h1">
                <Link to={AppRoutes.ROOT} title="Terug naar home">
                  Mijn Amsterdam
                </Link>
              </Heading>
            ) : (
              <Heading size="large" el="h1">
                Mijn Amsterdam
              </Heading>
            )}
          </span>
        </div>

        <div className={classNames(styles.MainHeaderHero)}>
          <picture>
            <source
              media="(orientation: portrait) and (max-width: 320px)"
              srcSet={srcSet.PORTRAIT_SMALL}
            />
            <source
              media="(orientation: portrait) and (-webkit-min-device-pixel-ratio: 2) and (min-width: 320px)"
              srcSet={srcSet.PORTRAIT_SMALL_2X}
            />
            <source
              media="(orientation: portrait) and (-webkit-min-device-pixel-ratio: 3) and (min-width: 320px)"
              srcSet={srcSet.PORTRAIT_SMALL_3X}
            />
            <source
              media="(max-width: 1024px)"
              srcSet={srcSet.LANDSCAPE_SMALL}
            />
            <source
              media="(min-width: 1024px)"
              srcSet={srcSet.LANDSCAPE_MEDIUM}
            />
            <source
              media="(min-width: 1440px)"
              srcSet={srcSet.LANDSCAPE_LARGE}
            />
            <img src={srcSet.FALLBACK} className={styles.Image} alt="" />
          </picture>
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
            Als het probleem zich blijft voordoen maak melding bij “Uw mening”
            aan de rechter zijkant van deze pagina.
          </p>
          {error && (
            <p>
              <strong>Fout:</strong> {error.toString()}
            </p>
          )}
          <Heading size="tiny" el="h4">
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
                    <a href="https://formulieren.amsterdam.nl/tripleforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Klachtenformulier.aspx">
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
          <div className={footerStyles.InnerContainer}>
            {BOTTOM_LINKS.map((link) => (
              <Linkd
                key={link.title}
                href={link.to}
                external={isExternalUrl(link.to)}
              >
                {link.title}
              </Linkd>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
