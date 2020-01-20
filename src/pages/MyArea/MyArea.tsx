import { AppContext } from 'AppState';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import React, { useContext } from 'react';

import styles from './MyArea.module.scss';

export default () => {
  const {
    MIJN_BUURT: {
      url: { advanced: mapUrl },
    },
  } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap url={mapUrl} />
      </div>
    </div>
  );
};
