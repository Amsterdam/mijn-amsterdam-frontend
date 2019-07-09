import React, { useContext } from 'react';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import styles from './MyArea.module.scss';
import { AppContext } from '../../AppState';
import { getFullAddress } from 'data-formatting/brp';

export default () => {
  const {
    BRP: { adres },
  } = useContext(AppContext);

  const currentAddress = adres && adres.straatnaam && getFullAddress(adres);

  if (!currentAddress) {
    return null;
  }

  return (
    <div className={styles.Container}>
      <MyAreaHeader trackCategory="MA_Mijn_buurt/Detail_Pagina" />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap
          trackCategory="MA_Mijn_buurt/Detail_Pagina"
          address={currentAddress}
          simpleMap={false}
        />
      </div>
    </div>
  );
};
