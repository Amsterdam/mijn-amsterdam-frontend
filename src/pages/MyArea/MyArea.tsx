import React from 'react';
import MyArea, { MyAreaHeader } from 'components/MyArea/MyArea';
import styles from './MyArea.module.scss';

export default () => {
  return (
    <>
      <MyAreaHeader />
      <div className={styles.MyAreaContainer}>
        <MyArea />
      </div>
    </>
  );
};
