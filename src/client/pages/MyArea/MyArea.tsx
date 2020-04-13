import { IS_ACCEPTANCE, IS_PRODUCTION } from '../../../universal/env';
import { MyAreaHeader, MyAreaMap, MyAreaMapIFrame } from '../../components';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import { getFullAddress } from '../Profile/formatData';
import styles from './MyArea.module.scss';

export default () => {
  const { BUURT, BAG, BRP } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {IS_PRODUCTION || IS_ACCEPTANCE ? (
        <MyAreaMapIFrame url={BUURT.content?.embed.advanced} />
      ) : (
        !!BAG.content?.latlng && (
          <MyAreaMap
            className={styles.Map}
            center={BAG.content?.latlng}
            homeAddress={
              BRP.content?.adres && getFullAddress(BRP.content.adres)
            }
          />
        )
      )}
    </div>
  );
};
