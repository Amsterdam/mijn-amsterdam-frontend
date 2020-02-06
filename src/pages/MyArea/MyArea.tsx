import { AppContext } from 'AppState';
import {
  MyAreaHeader,
  MyAreaMapIFrame,
  MyAreaMap,
} from 'components/MyArea/MyArea';
import React, { useContext } from 'react';

import styles from './MyArea.module.scss';
import { getFullAddress } from 'data-formatting/brp';
import { IS_PRODUCTION, IS_ACCEPTANCE } from '../../env';

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
          center={centroid}
          homeAddress={BRP.data?.adres && getFullAddress(BRP.data.adres)}
        />
      )}
    </div>
  );
};
