import { AppContext } from 'AppState';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import React, { useContext } from 'react';

import styles from './MyArea.module.scss';

export default () => {
  const {
    MY_AREA: {
      url: { advanced: mapUrl },
    },
  } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader trackCategory="MA_Mijn_buurt/Detail_Pagina" />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap trackCategory="MA_Mijn_buurt/Detail_Pagina" url={mapUrl} />
      </div>
    </div>
  );
};
