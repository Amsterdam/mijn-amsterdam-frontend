import React from 'react';
import { MyAreaHeader, MyAreaMap } from 'components/MyArea/MyArea';
import styles from './MyArea.module.scss';

export default () => {
  return (
    <>
      <MyAreaHeader />
      <div className={styles.MyAreaContainer}>
        <MyAreaMap />
      </div>
    </>
  );
};
