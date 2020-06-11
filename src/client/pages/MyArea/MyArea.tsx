import React, { useContext } from 'react';
import { getOtapEnvItem } from '../../../universal/config/env';
import { AppContext } from '../../AppState';
import { MyAreaHeader, MyAreaMapIFrame } from '../../components';
import styles from './MyArea.module.scss';

export default () => {
  const { BUURT } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {getOtapEnvItem('isMyAreaMapEnabled') && (
        <MyAreaMapIFrame url={BUURT.content?.embed.advanced} />
      )}
    </div>
  );
};
