import { IS_AP } from '../../../universal/config/env';
import { MyAreaHeader, MyAreaMapIFrame } from '../../components';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import styles from './MyArea.module.scss';

export default () => {
  const { BUURT } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {IS_AP && <MyAreaMapIFrame url={BUURT.content?.embed.advanced} />}
    </div>
  );
};
