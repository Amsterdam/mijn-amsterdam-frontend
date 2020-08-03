import React from 'react';
import { getOtapEnvItem } from '../../../universal/config/env';
import { MyAreaMapIFrame, MyAreaHeader } from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './MyArea.module.scss';

export default () => {
  const { BUURT } = useAppStateGetter();

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {getOtapEnvItem('isMyAreaMapEnabled') && (
        <MyAreaMapIFrame url={BUURT.content?.embed.advanced} />
      )}
    </div>
  );
};
