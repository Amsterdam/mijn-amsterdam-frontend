import React from 'react';
import styles from './MainHeaderHero.module.scss';
import useReactRouter from 'use-react-router';
import { AppRoutes } from 'App.constants';

// TODO: Enable if we have appropriate responsive images
// For now, 3 versions of the landscape image can be delivered: 1024, 1366 and 1600
function imgUrl(
  imageName: string,
  w: number,
  orientation: 'l' | 'p' = 'l',
  pd: number = 1
) {
  const r = orientation === 'p' ? 0.4 : 0.25;
  return `/header/${imageName}-${Math.round(pd * w)}x${Math.round(
    pd * (w * r)
  )}.jpg`;
}

const DEFAULT_ALT = 'Sfeerbeeld kenmerkend voor de Amsterdammer';

// TBD: Which size for mobile + tablet
// const PORTRAIT_SMALL = imgUrl('//placehold.it/', 360, 'p');
// const PORTRAIT_SMALL_2X = imgUrl('//placehold.it/', 360, 'p', 2);
// const PORTRAIT_SMALL_3X = imgUrl('//placehold.it/', 360, 'p', 3);

// const LANDSCAPE_SMALL = imgUrl('//placehold.it/', 1024);
// const LANDSCAPE_MEDIUM = imgUrl('//placehold.it/', 1366);
// const LANDSCAPE_LARGE = imgUrl('//placehold.it/', 1600);

function getHeroSrc() {
  const { location } = useReactRouter();
  const isChapterPath = (path: string) => location.pathname.startsWith(path);

  let imageName = 'Header-Desktop-1';

  switch (true) {
    // case isChapterPath(AppRoutes.PROFILE):
    //   imageName = 'Header-Desktop-2';
    //   break;
    // case isChapterPath(AppRoutes.INKOMEN):
    //   imageName = 'Header-Desktop-4';
    //   break;
    default:
      imageName = 'Header-Desktop-1';
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

  return {
    PORTRAIT_SMALL: imgUrl(imageName, 360, 'p'),
    PORTRAIT_SMALL_2X: imgUrl(imageName, 360, 'p', 2),
    PORTRAIT_SMALL_3X: imgUrl(imageName, 360, 'p', 3),
    LANDSCAPE_SMALL: imgUrl(imageName, 1024),
    LANDSCAPE_MEDIUM: imgUrl(imageName, 1366),
    LANDSCAPE_LARGE: imgUrl(imageName, 1600),
  };
}

export interface MainHeaderHeroProps {
  src: string;
  alt: string;
}

export default function MainHeaderHero(props: Partial<MainHeaderHeroProps>) {
  const srcSet = getHeroSrc();
  const alt = props.alt || DEFAULT_ALT;

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
        <img src={srcSet.LANDSCAPE_MEDIUM} className={styles.Image} alt={alt} />
      </picture>
    </div>
  );
}
