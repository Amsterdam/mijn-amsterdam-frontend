import React from 'react';
import styles from './MyArea2.module.scss';
import MyArea from '../../components/MyArea/MyArea2';
import { MyAreaHeader } from '../../components';

interface MyArea2Props {
  homeAddress?: string;
  center?: LatLngObject | null;
}

export default function MyArea2({ homeAddress, center }: MyArea2Props) {
  return (
    <div className={styles.MyArea2}>
      <MyAreaHeader />
      <MyArea center={center} homeAddress={homeAddress} />
    </div>
  );
}
