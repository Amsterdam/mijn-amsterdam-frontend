import { useMemo } from 'react';

import classnames from 'classnames';

import styles from './MainHeaderHero.module.scss';
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
  profileType: ProfileType,
  imageName: string,
  width: number,
  orientation: 'landscape' | 'portrait' = 'landscape',
  pixelDensity: number = 1,
  ext = 'webp'
) {
  const ratio =
    orientation === 'portrait' ? PORTRAIT_SCREEN_RATIO : LANDSCAPE_SCREEN_RATIO;
  return `/header${profileType === 'commercial' ? '/zakelijk' : ''}/${Math.round(pixelDensity * width)}x${Math.round(
    pixelDensity * (width * ratio)
  )}-${imageName}.${ext}`;
}

function useHeroSrc(profileType: ProfileType) {
  const imageName = 'algemeen';

  // ------------------------------------------------------------
  // Produces the following image urls
  // ------------------------------------------------------------
  // PORTRAIT_SMALL: '/header/1080x432-$imageName.jpg';
  // PORTRAIT_SMALL_2X: '/header/1366x342-$imageName.jpg';
  // PORTRAIT_SMALL_3X: '/header/1024x256-$imageName.jpg';
  // LANDSCAPE_LARGE: '/header/1600x400-$imageName.jpg';

  return useMemo(() => {
    if (!imageName) {
      return null;
    }
    return {
      PORTRAIT_SMALL: imgUrl(
        profileType,
        imageName,
        IMAGE_SIZES.PORTRAIT_SMALL,
        'portrait',
        PIXEL_DENSITIES.STANDARD
      ),
      PORTRAIT_SMALL_2X: imgUrl(
        profileType,
        imageName,
        IMAGE_SIZES.PORTRAIT_SMALL,
        'portrait',
        PIXEL_DENSITIES.RETINA
      ),
      PORTRAIT_SMALL_3X: imgUrl(
        profileType,
        imageName,
        IMAGE_SIZES.PORTRAIT_SMALL,
        'portrait',
        PIXEL_DENSITIES.HIGH_DPI
      ),
      LANDSCAPE_LARGE: imgUrl(
        profileType,
        imageName,
        IMAGE_SIZES.LANDSCAPE_LARGE,
        'landscape',
        PIXEL_DENSITIES.STANDARD
      ),
      FALLBACK: imgUrl(
        profileType,
        imageName,
        IMAGE_SIZES.LANDSCAPE_LARGE,
        'landscape',
        PIXEL_DENSITIES.STANDARD,
        'jpg'
      ),
    };
  }, [imageName]);
}

export function MainHeaderHero() {
  const profileType = useProfileTypeValue();
  const srcSet = useHeroSrc(profileType);

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
          media="(min-width: 575px)"
          srcSet={imgUrl(
            profileType,
            'algemeen',
            IMAGE_SIZES.LANDSCAPE_LARGE,
            'landscape',
            PIXEL_DENSITIES.STANDARD
          )}
        />
        <img
          src={imgUrl(
            profileType,
            'algemeen',
            IMAGE_SIZES.LANDSCAPE_LARGE,
            'landscape',
            PIXEL_DENSITIES.STANDARD,
            'jpg'
          )}
          className={styles.Image}
          alt=""
        />
      </picture>
    </div>
  );
}
