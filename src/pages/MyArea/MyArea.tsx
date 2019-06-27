import React from 'react';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import styles from './MyArea.module.scss';

export default () => {
  return (
    <>
      <MyAreaHeader trackCategory="MA_Mijn_buurt/Detail_Pagina" />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap trackCategory="MA_Mijn_buurt/Detail_Pagina" />
      </div>
    </>
  );
};
