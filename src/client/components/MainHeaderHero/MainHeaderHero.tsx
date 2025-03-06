import { useMemo } from 'react';

import classnames from 'classnames';
import { useLocation, matchPath } from 'react-router-dom';

import styles from './MainHeaderHero.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { useProfileTypeValue } from '../../hooks/useProfileType';

const LANDSCAPE_SCREEN_RATIO = 0.25;
const PORTRAIT_SCREEN_RATIO = 0.4;

const IMAGE_SIZES = {
  PORTRAIT_SMALL: 360,
  LANDSCAPE_SMALL: 1024,
  LANDSCAPE_MEDIUM: 1366,
  LANDSCAPE_LARGE: 1600,
};

const PIXEL_DENSITIES = {
  STANDARD: 1,
  RETINA: 2,
  HIGH_DPI: 3,
};

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
  const isCommercialHeader = profileType.includes('commercial');
  const isThemaPath = (path: string) =>
    !!matchPath(location.pathname, {
      path,
      exact: false,
      strict: false,
    });

  let imageName: string;
  let dir = '';

  // TODO: Make more dynamic. Maybe with image names based on profileType and Thema
  switch (true) {
    case isCommercialHeader:
      dir = '/zakelijk';
      imageName = 'algemeen';
      switch (true) {
        case isThemaPath(AppRoutes.INKOMEN):
          imageName = 'inkomen';
          break;
        case isThemaPath(AppRoutes.VERGUNNINGEN):
          imageName = 'vergunningen';
          break;
      }
      break;
    case isThemaPath(AppRoutes.BRP):
      imageName = 'burgerzaken';
      break;
    case isThemaPath(AppRoutes.INKOMEN):
      imageName = 'werk';
      break;
    case isThemaPath(AppRoutes.ZORG):
      imageName = 'zorg';
      break;
    case isThemaPath(AppRoutes.AFVAL):
      imageName = 'afval';
      break;
    case isThemaPath(AppRoutes.TOERISTISCHE_VERHUUR):
      imageName = 'toerisme';
      break;
    case isThemaPath(AppRoutes.KREFIA):
      imageName = 'krefia';
      break;

    case isThemaPath(AppRoutes.SEARCH):
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
      PORTRAIT_SMALL: imgUrl(
        imageName,
        IMAGE_SIZES.PORTRAIT_SMALL,
        'portrait',
        PIXEL_DENSITIES.STANDARD,
        dir
      ),
      PORTRAIT_SMALL_2X: imgUrl(
        imageName,
        IMAGE_SIZES.PORTRAIT_SMALL,
        'portrait',
        PIXEL_DENSITIES.RETINA,
        dir
      ),
      PORTRAIT_SMALL_3X: imgUrl(
        imageName,
        IMAGE_SIZES.PORTRAIT_SMALL,
        'portrait',
        PIXEL_DENSITIES.HIGH_DPI,
        dir
      ),
      LANDSCAPE_SMALL: imgUrl(
        imageName,
        IMAGE_SIZES.LANDSCAPE_SMALL,
        'landscape',
        PIXEL_DENSITIES.STANDARD,
        dir
      ),
      LANDSCAPE_MEDIUM: imgUrl(
        imageName,
        IMAGE_SIZES.LANDSCAPE_MEDIUM,
        'landscape',
        PIXEL_DENSITIES.STANDARD,
        dir
      ),
      LANDSCAPE_LARGE: imgUrl(
        imageName,
        IMAGE_SIZES.LANDSCAPE_LARGE,
        'landscape',
        PIXEL_DENSITIES.STANDARD,
        dir
      ),
      FALLBACK: imgUrl(
        imageName,
        IMAGE_SIZES.LANDSCAPE_LARGE,
        'landscape',
        PIXEL_DENSITIES.STANDARD,
        dir,
        'jpg'
      ),
    };
  }, [imageName, dir]);
}

export function MainHeaderHero() {
  const srcSet = useHeroSrc();
  const profileType = useProfileTypeValue();

  if (srcSet === null) {
    return null;
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
