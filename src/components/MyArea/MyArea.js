import React from 'react';
import { withRouter } from 'react-router-dom';
import styles from './MyArea.module.scss';
import { MAP_URL } from './MyArea.constants';
import { AppRoutes } from 'App.constants';

const MyArea = ({ history }) => {
  return (
    <div className={styles.MyArea}>
      <iframe
        id="mapIframe"
        title="Map of my area"
        src={MAP_URL}
        className={styles.Map}
      />
      <div
        onClick={() => history.push(AppRoutes.MY_AREA)}
        className={styles.Overlay}
      />
    </div>
  );
};

export default withRouter(MyArea);
