import React from 'react';
import { withRouter, NavLink, RouteComponentProps } from 'react-router-dom';
import styles from './MyArea.module.scss';
import { MAP_URL } from './MyArea.constants';
import { AppRoutes } from 'App.constants';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import Heading from 'components/Heading/Heading';

export const MyAreaHeader = () => {
  return (
    <div className={styles.Header}>
      <Logo />
      <h1>Mijn Buurt</h1>

      <NavLink to={AppRoutes.ROOT} className={styles.CloseBtn}>
        Sluit kaart
        <CloseIcon />
      </NavLink>
    </div>
  );
};

export const MyAreaMap = () => {
  return (
    <iframe
      id="mapIframe"
      title="Map of my area"
      src={MAP_URL}
      className={styles.Map}
    />
  );
};

const MyArea: React.SFC<RouteComponentProps> = ({ history }) => {
  return (
    <div className={styles.MyArea}>
      <MyAreaMap />
      <div
        onClick={() => history.push(AppRoutes.MY_AREA)}
        className={styles.Overlay}
      >
        <div className={styles.Content}>
          <Heading size="large">Mijn Buurt</Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw eigen
            woning
          </p>
        </div>
      </div>
    </div>
  );
};

export default withRouter(MyArea);
