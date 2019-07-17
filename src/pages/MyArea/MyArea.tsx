import { AppContext } from 'AppState';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import React, { useContext } from 'react';

import styles from './MyArea.module.scss';
import { usePhoneScreen } from 'hooks/media.hook';

export default () => {
  let {
    MY_AREA: {
      url: { advanced: mapUrl },
    },
  } = useContext(AppContext);

  // We have to figure out if we are on a phone screen on this level and not in
  // the hook who builds the map url since hooks need to be called in a React
  // component
  mapUrl = mapUrl + `&legenda=${!usePhoneScreen()}`;

  return (
    <div className={styles.Container}>
      <MyAreaHeader trackCategory="MA_Mijn_buurt/Detail_Pagina" />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap trackCategory="MA_Mijn_buurt/Detail_Pagina" url={mapUrl} />
      </div>
    </div>
  );
};
