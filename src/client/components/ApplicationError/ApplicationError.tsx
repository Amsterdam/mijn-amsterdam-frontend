import { Link } from 'react-router-dom';
import { FallbackProps } from 'react-error-boundary';
import classNames from 'classnames';
import styles from './ApplicationError.module.scss';
import { AppRoutes } from '../../../universal/config';
import { useDesktopScreen } from '../../hooks';
import Heading from '../Heading/Heading';
import { ReactComponent as AmsterdamLogoLarge } from '../../assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from '../../assets/images/logo-amsterdam.svg';
import { PageContent, TextPage } from '../Page/Page';
import PageHeading from '../PageHeading/PageHeading';

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

  return (
    <>
      {/* <h1>Kritieke applicatie fout</h1>
      <p>
        <strong>Error:</strong> {error && error.toString()}
      </p> */}
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
      <TextPage>
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
          <p>
            <strong>Error:</strong> {error && error.toString()}
          </p>
        </PageContent>
      </TextPage>
    </>
  );
}
