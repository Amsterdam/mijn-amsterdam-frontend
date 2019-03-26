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
import { ButtonText, SubMenuItems } from './MainNavBar.constants';

function MainNavLink({ children, to, ...rest }) {
  return (
    <NavLink to={to} className={styles.MainNavLink} {...rest}>
      {children}
    </NavLink>
  );
}

export default function MainNavBar() {
  const [showSubMenu, setShowSubMenu] = useState(false);

  function setSubMenuVisibility() {
    const inSubMenu = SubMenuItems.indexOf(document.activeElement.id) >= 0;
    if (showSubMenu) {
      if (!inSubMenu) {
        setShowSubMenu(false);
      }
    } else {
      if (inSubMenu) {
        setShowSubMenu(true);
      }
    }
  }

  return (
    <nav className={styles.MainNavBar}>
      <div className={styles.LinkContainer}>
        <MainNavLink
          id={ButtonText.HOME}
          to={AppRoutes.ROOT}
          onFocus={setSubMenuVisibility}
        >
          {ButtonText.HOME}
        </MainNavLink>
        <MainNavSubmenu
          id={ButtonText.MIJN_THEMAS}
          title={ButtonText.MIJN_THEMAS}
          open={showSubMenu}
          onFocus={setSubMenuVisibility}
        >
          <MainNavSubmenuLink
            id={ButtonText.BURGERZAKEN}
            to={AppRoutes.BURGERZAKEN}
            onFocus={setSubMenuVisibility}
          >
            <BurgerzakenIcon />
            {ButtonText.BURGERZAKEN}
          </MainNavSubmenuLink>
          <MainNavSubmenuLink
            id={ButtonText.GEZONDHEID}
            to={AppRoutes.GEZONDHEID}
            onFocus={setSubMenuVisibility}
          >
            <GezondheidIcon />
            {ButtonText.GEZONDHEID}
          </MainNavSubmenuLink>
          <MainNavSubmenuLink
            id={ButtonText.WONEN}
            to={AppRoutes.WONEN}
            onFocus={setSubMenuVisibility}
          >
            <WonenIcon />
            {ButtonText.WONEN}
          </MainNavSubmenuLink>
          <MainNavSubmenuLink
            id={ButtonText.INKOMEN}
            to={AppRoutes.INKOMEN}
            onFocus={setSubMenuVisibility}
          >
            <InkomenIcon />
            {ButtonText.INKOMEN}
          </MainNavSubmenuLink>
          <MainNavSubmenuLink
            id={ButtonText.BELASTINGEN}
            to={AppRoutes.BELASTINGEN}
            onFocus={setSubMenuVisibility}
          >
            <BelastingenIcon />
            {ButtonText.BELASTINGEN}
          </MainNavSubmenuLink>
        </MainNavSubmenu>
        <MainNavLink
          id={ButtonText.MIJN_BUURT}
          to={AppRoutes.MIJN_BUURT}
          onFocus={setSubMenuVisibility}
        >
          {ButtonText.MIJN_BUURT}
        </MainNavLink>
        <MainNavLink
          id={ButtonText.MIJN_UPDATES}
          to={AppRoutes.MIJN_UPDATES}
          onFocus={setSubMenuVisibility}
        >
          {ButtonText.MIJN_UPDATES}
        </MainNavLink>
      </div>
    </nav>
  );
}
