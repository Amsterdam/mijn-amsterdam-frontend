import React from 'react';
import { getOtapEnvItem } from '../../../universal/config/env';
import { MyAreaHeader, MyAreaMapIFrame } from '../../components';
import { useAppStateAtom } from '../../hooks/useAppState';
import styles from './MyArea.module.scss';

export default () => {
  const { BUURT } = useAppStateAtom();

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {getOtapEnvItem('isMyAreaMapEnabled') && (
        <MyAreaMapIFrame url={BUURT.content?.embed.advanced} />
      )}
    </div>
  );
};
