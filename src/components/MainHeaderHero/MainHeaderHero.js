import React from 'react';
import styles from './MainHeaderHero.module.scss';
import useReactRouter from 'use-react-router';
import { AppRoutes } from 'App.constants';

// TODO: Enable if we have appropriate responsive images
// For now, 3 versions of the landscape image can be delivered: 1024, 1366 and 1600
// function imgUrl(path, w, orientation = 'l', pd = 1) {
//   const r = orientation === 'p' ? 0.4 : 0.25;
//   return `${path}${Math.round(pd * w)}x${Math.round(pd * (w * r))}`;
// }

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
  switch (location.pathname) {
    case AppRoutes.ROOT:
      return 'header/Header-Desktop-1.jpg';
    case AppRoutes.PROFILE:
      return 'header/Header-Desktop-2.jpg';
    default:
      return 'header/Header-Desktop-3.jpg';
  }
}

export default function MainHeaderHero(props) {
  const src = props.src || getHeroSrc();
  const alt = props.alt || DEFAULT_ALT;
  return (
    <div className={styles.MainHeaderHero}>
      <picture>
        {/* <source
          media="(orientation: portrait) and (max-width: 360px)"
          srcset={PORTRAIT_SMALL}
        />
        <source
          media="(orientation: portrait) and (-webkit-min-device-pixel-ratio: 2) and (min-width: 360px)"
          srcset={PORTRAIT_SMALL_2X}
        />
        <source
          media="(orientation: portrait) and (-webkit-min-device-pixel-ratio: 3) and (min-width: 360px)"
          srcset={PORTRAIT_SMALL_3X}
        />
        <source
          media="(orientation: landscape) and (max-width: 1024px)"
          srcset={LANDSCAPE_SMALL}
        />
        <source
          media="(orientation: landscape) and (min-width: 1440px)"
          srcset={LANDSCAPE_LARGE}
        />
        <source
          media="(orientation: landscape) and (min-width: 1200px)"
          srcset={LANDSCAPE_MEDIUM}
        />
        */}
        <img src={src} className={styles.TheImg} alt={alt} />
      </picture>
    </div>
  );
}
