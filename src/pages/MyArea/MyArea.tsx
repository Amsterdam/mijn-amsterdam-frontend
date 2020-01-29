import { AppContext } from 'AppState';
import {
  MyAreaHeader,
  MyAreaMapIFrame,
  MyAreaMap,
} from 'components/MyArea/MyArea';
import React, { useContext } from 'react';

import styles from './MyArea.module.scss';
import { isProduction, isAcceptance } from 'helpers/App';
import { getFullAddress } from 'data-formatting/brp';

export default () => {
  const {
    MIJN_BUURT: {
      url: { advanced: mapUrl },
      centroid,
    },
    BRP,
  } = useContext(AppContext);

  return (
    <div className={styles.Container}>
      <MyAreaHeader />
      {isProduction() || isAcceptance() ? (
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
