import { useMemo } from 'react';

import { AppRoutes } from '../../../universal/config';
import { matchPath } from 'react-router';
import styles from './MainHeaderHero.module.scss';
import { useLocation } from 'react-router-dom';
import classnames from 'classnames';
import { useProfileTypeValue } from '../../hooks/useProfileType';

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

function useHeroSrc() {
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const isCommercialHeader = profileType !== 'private';
  const isChapterPath = (path: string) =>
    !!matchPath(location.pathname, {
      path,
      exact: false,
      strict: false,
    });

  let imageName: string;
  let dir = '';

  // TODO: Make more dynamic. Maybe with image names based on profileType and Chapter
  switch (true) {
    case isCommercialHeader:
      dir = '/zakelijk';
      imageName = 'algemeen';
      switch (true) {
        case isChapterPath(AppRoutes.INKOMEN):
          imageName = 'inkomen';
          break;
        case isChapterPath(AppRoutes.VERGUNNINGEN):
          imageName = 'vergunningen';
          break;
      }
      break;
    case isChapterPath(AppRoutes.BRP):
      imageName = 'burgerzaken';
      break;
    case isChapterPath(AppRoutes.INKOMEN):
      imageName = 'werk';
      break;
    case isChapterPath(AppRoutes.ZORG):
      imageName = 'zorg';
      break;
    case isChapterPath(AppRoutes.AFVAL):
      imageName = 'afval';
      break;
    case isChapterPath(AppRoutes.TOERISTISCHE_VERHUUR):
      imageName = 'toerisme';
      break;
    case isChapterPath(AppRoutes.KREFIA):
      imageName = 'krefia';
      break;

    case isChapterPath(AppRoutes.SEARCH):
      imageName = '';
      break;

    default:
      imageName = 'algemeen';
      break;
  }

  // ------------------------------------------------------------
  // Produces the following image urls
  // ------------------------------------------------------------
  // PORTRAIT_SMALL: '/header/1600x400-$imageName.jpg';
  // PORTRAIT_SMALL_2X: '/header/1366x342-$imageName.jpg';
  // PORTRAIT_SMALL_3X: '/header/1024x256-$imageName.jpg';
  // LANDSCAPE_SMALL: '/header/360x144-$imageName.jpg';
  // LANDSCAPE_MEDIUM: '/header/720x288-$imageName.jpg';
  // LANDSCAPE_LARGE: '/header/1080x432-$imageName.jpg';

  return useMemo(() => {
    if (!imageName) {
      return null;
    }
    return {
      PORTRAIT_SMALL: imgUrl(imageName, 360, 'portrait', 1, dir),
      PORTRAIT_SMALL_2X: imgUrl(imageName, 360, 'portrait', 2, dir),
      PORTRAIT_SMALL_3X: imgUrl(imageName, 360, 'portrait', 3, dir),
      LANDSCAPE_SMALL: imgUrl(imageName, 1024, 'landscape', 1, dir),
      LANDSCAPE_MEDIUM: imgUrl(imageName, 1366, 'landscape', 1, dir),
      LANDSCAPE_LARGE: imgUrl(imageName, 1600, 'landscape', 1, dir),
      FALLBACK: imgUrl(imageName, 1600, 'landscape', 1, dir, 'jpg'),
    };
  }, [imageName, dir]);
}

export default function MainHeaderHero() {
  const srcSet = useHeroSrc();
  const profileType = useProfileTypeValue();

  if (srcSet === null) {
    return <div className={styles.MainHeaderHeroPlaceHolder} />;
  }

  return (
    <div
      className={classnames(
        styles.MainHeaderHero,
        profileType !== 'private' && styles['MainHeaderHero--commercial']
      )}
    >
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
        <source media="(max-width: 1024px)" srcSet={srcSet.LANDSCAPE_SMALL} />
        <source media="(min-width: 1024px)" srcSet={srcSet.LANDSCAPE_MEDIUM} />
        <source media="(min-width: 1440px)" srcSet={srcSet.LANDSCAPE_LARGE} />
        <img src={srcSet.FALLBACK} className={styles.Image} alt="" />
      </picture>
    </div>
  );
}
