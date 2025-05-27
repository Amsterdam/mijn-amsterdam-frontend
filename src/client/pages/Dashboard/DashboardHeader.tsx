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
  const [primaryLocation = null] = MY_LOCATION.content ?? [];
  const profileType = useProfileTypeValue();

  let stadsdeel =
    primaryLocation?.bagAddress?.gebiedenStadsdeelNaam?.toLowerCase();

  if (!stadsdeel || !STADSDELEN.includes(stadsdeel)) {
    stadsdeel = `buiten-amsterdam-${profileType}`;
  }

  return {
    small: `/img/stadsdeel-foto/small/${stadsdeel}.jpg`,
    large: `/img/stadsdeel-foto/large/${stadsdeel}.jpg`,
    defaultImg: `/img/stadsdeel-foto/buiten-amsterdam-default-${profileType}.jpg`,
  };
}

export function DashboardHeader() {
  const { MY_LOCATION } = useAppStateGetter();
  const { large, small, defaultImg } = useStadsdeelFoto();
  const [isLoading, setIsLoading] = useState(true);
  const isPhoneScreen = usePhoneScreen();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const hasLocation = !!MY_LOCATION?.content?.length;

  useEffect(() => {
    if (!hasLocation) {
      return;
    }
    if (!imgRef.current) {
      const img = new Image();
      console.log('Loading image:', isPhoneScreen ? small : large);
      imgRef.current = img;
      img.src = isPhoneScreen ? small : large;
      img.onload = () => setIsLoading(false);
      img.onerror = () => setIsLoading(false);
    } else {
      if (imgRef.current.src !== (isPhoneScreen ? small : large)) {
        imgRef.current.src = isPhoneScreen ? small : large;
      }

      setIsLoading(true);
      console.log(imgRef.current);
    }
  }, [hasLocation, isPhoneScreen, imgRef.current, small, large]);

  return (
    <header className={styles.DashboardHeader}>
      <div className={styles.DashboardHeaderInner}>
        {!isLoading && (
          <img
            className={classNames(styles.DashboardHeaderImg, styles.fadeIn)}
            src={imgRef.current?.src}
            alt=""
          />
        )}
        <img
          className={classNames(styles.DashboardHeaderImg, styles.default)}
          src={defaultImg}
          alt=""
        />
        <div className={styles.DashboardHeaderSearch}>
          <Search />
        </div>
      </div>
    </header>
  );
}
