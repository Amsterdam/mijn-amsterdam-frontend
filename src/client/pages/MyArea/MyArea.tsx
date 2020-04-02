import { IS_ACCEPTANCE, IS_PRODUCTION } from '../../../env';
import {
  MyAreaHeader,
  MyAreaMap,
  MyAreaMapIFrame,
} from '../../components/MyArea/MyArea';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import { getFullAddress } from '../../data-formatting/brp';
import styles from './MyArea.module.scss';

export default () => {
  const {
    MIJN_BUURT: {
      data: {
        url: { advanced: mapUrl },
        centroid,
      },
    },
    BRP,
  } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {IS_PRODUCTION || IS_ACCEPTANCE ? (
        <MyAreaMapIFrame url={mapUrl} />
      ) : (
        <MyAreaMap
          className={styles.Map}
          center={centroid}
          homeAddress={BRP.data?.adres && getFullAddress(BRP.data.adres)}
        />
      )}
    </div>
  );
};
