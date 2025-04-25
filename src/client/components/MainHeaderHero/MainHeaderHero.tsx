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

export function MainHeaderHero() {
  const profileType = useProfileTypeValue();

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
