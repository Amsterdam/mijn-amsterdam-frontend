import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { AppRoutes } from 'App.constants';

import styles from './MainNavBar.module.scss';
import { ReactComponent as BurgerzakenIcon } from 'assets/images/burgerzaken.svg';
import { ReactComponent as GezondheidIcon } from 'assets/images/gezondheid.svg';
import { ReactComponent as WonenIcon } from 'assets/images/wonen.svg';
import { ReactComponent as InkomenIcon } from 'assets/images/inkomen.svg';
import { ReactComponent as BelastingenIcon } from 'assets/images/belastingen.svg';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';

const SubMenuId = {
  MIJN_THEMAS: 'mijn-themas',
};

function MainNavLink({ children, to }) {
  return (
    <NavLink to={to} className={styles.MainNavLink}>
      {children}
    </NavLink>
  );
}

export default function MainNavBar() {
  const [activeSubmenuId, setActiveSubmenu] = useState('');

  function toggleSubmenu(submenuId) {
    setActiveSubmenu(activeSubmenuId !== submenuId ? submenuId : '');
  }

  return (
    <nav className={styles.MainNavBar}>
      <div className={styles.LinkContainer}>
        <MainNavLink to={AppRoutes.ROOT}>Home</MainNavLink>
        <MainNavSubmenu
          title="Mijn thema's"
          toggleSubmenu={() => toggleSubmenu(SubMenuId.MIJN_THEMAS)}
          isActive={SubMenuId.MIJN_THEMAS === activeSubmenuId}
        >
          <MainNavSubmenuLink to={AppRoutes.BURGERZAKEN}>
            <BurgerzakenIcon />
            Burgerzaken
          </MainNavSubmenuLink>
          <MainNavSubmenuLink to={AppRoutes.GEZONDHEID}>
            <GezondheidIcon />
            Gezondheid
          </MainNavSubmenuLink>
          <MainNavSubmenuLink to={AppRoutes.WONEN}>
            <WonenIcon />
            Wonen
          </MainNavSubmenuLink>
          <MainNavSubmenuLink to={AppRoutes.INKOMEN}>
            <InkomenIcon />
            Inkomen
          </MainNavSubmenuLink>
          <MainNavSubmenuLink to={AppRoutes.BELASTINGEN}>
            <BelastingenIcon />
            Belastingen
          </MainNavSubmenuLink>
        </MainNavSubmenu>
        <MainNavLink to={AppRoutes.MIJN_BUURT}>Mijn buurt</MainNavLink>
        <MainNavLink to={AppRoutes.MIJN_UPDATES}>Mijn updates</MainNavLink>
      </div>
    </nav>
  );
}
