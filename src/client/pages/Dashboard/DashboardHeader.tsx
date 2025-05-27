import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';

import styles from './DashboardHeader.module.scss';
import { Search } from '../../components/Search/Search';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';

const STADSDELEN = [
  'buiten-amsterdam',
  'centrum',
  'nieuw-west',
  'noord',
  'oost',
  'weesp',
  'west',
  'westpoort',
  'zuid',
  'zuidoost',
];

function useStadsdeelFoto() {
  const { MY_LOCATION } = useAppStateGetter();
  const isPhoneScreen = usePhoneScreen();
  const [primaryLocation = null] = MY_LOCATION.content ?? [];
  const profileType = useProfileTypeValue();

  let stadsdeel =
    primaryLocation?.bagAddress?.gebiedenStadsdeelNaam?.toLowerCase();

  if (!stadsdeel || !STADSDELEN.includes(stadsdeel)) {
    stadsdeel = `buiten-amsterdam-${profileType}`;
  }

  const size = isPhoneScreen ? 'small' : 'large';

  return {
    srcDefault: `/img/stadsdeel-foto/${size}/buiten-amsterdam-${profileType}.jpg`,
    src: stadsdeel ? `/img/stadsdeel-foto/${size}/${stadsdeel}.jpg` : null,
  };
}

export function DashboardHeader() {
  const { src, srcDefault } = useStadsdeelFoto();
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      return;
    }
    if (!imgRef.current) {
      const img = new Image();
      imgRef.current = img;
      img.src = src;
      img.onload = () => setIsLoading(false);
      img.onerror = () => setIsLoading(false);
    } else if (imgRef.current.src !== src) {
      imgRef.current.src = src;
      setIsLoading(true);
    }
  }, [src]);

  return (
    <header className={styles.DashboardHeader}>
      <div className={styles.DashboardHeaderInner}>
        {!!imgRef.current?.src && !isLoading && (
          <img
            className={classNames(styles.DashboardHeaderImg, styles.fadeIn)}
            src={imgRef.current.src}
            alt=""
          />
        )}
        <img
          className={classNames(styles.DashboardHeaderImg, styles.default)}
          src={srcDefault}
          alt=""
        />
        <div className={styles.DashboardHeaderSearch}>
          <Search />
        </div>
      </div>
    </header>
  );
}
