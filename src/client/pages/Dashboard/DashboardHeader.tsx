import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';

import styles from './DashboardHeader.module.scss';
import { isLoading } from '../../../universal/helpers/api';
import { Search } from '../../components/Search/Search';
import { useSmallScreen } from '../../hooks/media.hook';
import {
  useAppStateGetter,
  useAppStateReady,
} from '../../hooks/useAppStateStore';
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
  const isPhoneScreen = useSmallScreen();
  const [primaryLocation = null] = MY_LOCATION.content ?? [];
  const profileType = useProfileTypeValue();

  let stadsdeel =
    primaryLocation?.bagAddress?.gebiedenStadsdeelNaam?.toLowerCase();

  if (!stadsdeel || !STADSDELEN.includes(stadsdeel)) {
    stadsdeel = `buiten-amsterdam-${profileType}`;
  }

  const size = isPhoneScreen ? 'small' : 'large';

  return !isLoading(MY_LOCATION)
    ? `/img/stadsdeel-foto/${size}/${stadsdeel}.jpg`
    : null;
}

export function DashboardHeader() {
  const src = useStadsdeelFoto();
  const isAppStateReady = useAppStateReady();
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
    } else if (imgRef.current.src !== src) {
      imgRef.current.src = src;
      setIsLoading(true);
    }
  }, [src]);

  const [hasFade] = useState(!isAppStateReady);

  return (
    <header className={styles.DashboardHeader}>
      <div className={styles.DashboardHeaderInner}>
        <div className={styles.DashboardHeaderImgWrap}>
          {!!imgRef.current?.src && !isLoading && (
            <img
              className={classNames(
                styles.DashboardHeaderImg,
                hasFade && styles.fadeIn
              )}
              src={imgRef.current.src}
              alt=""
            />
          )}
        </div>
        <div className={styles.DashboardHeaderSearch}>
          <Search inPage={false} />
        </div>
      </div>
    </header>
  );
}
