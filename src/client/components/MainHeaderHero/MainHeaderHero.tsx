import React, { useMemo } from 'react';

import { AppRoutes } from '../../../universal/config';
import { SessionContext } from '../../SessionState';
import { matchPath } from 'react-router';
import styles from './MainHeaderHero.module.scss';
import useRouter from 'use-react-router';

const LANDSCAPE_SCREEN_RATIO = 0.25;
const PORTRAIT_SCREEN_RATIO = 0.4;

// TODO: Enable if we have appropriate responsive images
// For now, 3 versions of the landscape image can be delivered: 1024, 1366 and 1600
function imgUrl(
  imageName: string,
  width: number,
  orientation: 'landscape' | 'portrait' = 'landscape',
  pixelDensity: number = 1
) {
  const ratio =
    orientation === 'portrait' ? PORTRAIT_SCREEN_RATIO : LANDSCAPE_SCREEN_RATIO;
  return `/header/${Math.round(pixelDensity * width)}x${Math.round(
    pixelDensity * (width * ratio)
  )}-${imageName}.jpg`;
}

function useHeroSrc() {
  const { location } = useRouter();
  const isChapterPath = (path: string) =>
    !!matchPath(location.pathname, {
      path,
      exact: false,
      strict: false,
    });

  let imageName: string;

  switch (true) {
    case isChapterPath(AppRoutes.MIJN_GEGEVENS):
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
    default:
      imageName = 'algemeen';
      break;
  }

  // ------------------------------------------------------------
  // Produces the following image urls
  // ------------------------------------------------------------
  // PORTRAIT_SMALL: '/header/Header-Desktop-1-1600x400.jpg';
  // PORTRAIT_SMALL_2X: '/header/Header-Desktop-1-1366x342.jpg';
  // PORTRAIT_SMALL_3X: '/header/Header-Desktop-1-1024x256.jpg';
  // LANDSCAPE_SMALL: '/header/Header-Desktop-1-360x144.jpg';
  // LANDSCAPE_MEDIUM: '/header/Header-Desktop-1-720x288.jpg';
  // LANDSCAPE_LARGE: '/header/Header-Desktop-1-1080x432.jpg';

  return useMemo(
    () => ({
      PORTRAIT_SMALL: imgUrl(imageName, 360, 'portrait'),
      PORTRAIT_SMALL_2X: imgUrl(imageName, 360, 'portrait', 2),
      PORTRAIT_SMALL_3X: imgUrl(imageName, 360, 'portrait', 3),
      LANDSCAPE_SMALL: imgUrl(imageName, 1024),
      LANDSCAPE_MEDIUM: imgUrl(imageName, 1366),
      LANDSCAPE_LARGE: imgUrl(imageName, 1600),
    }),
    [imageName]
  );
}

export default function MainHeaderHero() {
  const srcSet = useHeroSrc();

  return (
    <div className={styles.MainHeaderHero}>
      <picture>
        <source
          media="(orientation: portrait) and (max-width: 360px)"
          srcSet={srcSet.PORTRAIT_SMALL}
        />
        <source
          media="(orientation: portrait) and (-webkit-min-device-pixel-ratio: 2) and (min-width: 360px)"
          srcSet={srcSet.PORTRAIT_SMALL_2X}
        />
        <source
          media="(orientation: portrait) and (-webkit-min-device-pixel-ratio: 3) and (min-width: 360px)"
          srcSet={srcSet.PORTRAIT_SMALL_3X}
        />
        <source
          media="(orientation: landscape) and (max-width: 1024px)"
          srcSet={srcSet.LANDSCAPE_SMALL}
        />
        <source
          media="(orientation: landscape) and (min-width: 1440px)"
          srcSet={srcSet.LANDSCAPE_LARGE}
        />
        <source
          media="(orientation: landscape) and (min-width: 1200px)"
          srcSet={srcSet.LANDSCAPE_MEDIUM}
        />
        <img src={srcSet.LANDSCAPE_MEDIUM} className={styles.Image} alt="" />
      </picture>
    </div>
  );
}
