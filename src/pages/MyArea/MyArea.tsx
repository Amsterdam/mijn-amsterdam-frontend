import React, { useContext } from 'react';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import styles from './MyArea.module.scss';
import { AppContext } from '../../AppState';

export default () => {
  const {
    BRP: { address },
  } = useContext(AppContext);

  const currentAddress = address && address.current && address.current.street;

  if (!currentAddress) {
    return null;
  }

  return (
    <>
      <MyAreaHeader trackCategory="MA_Mijn_buurt/Detail_Pagina" />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap
          trackCategory="MA_Mijn_buurt/Detail_Pagina"
          address={currentAddress}
          simpleMap={false}
        />
      </div>
    </>
  );
};
