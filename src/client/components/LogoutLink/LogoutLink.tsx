import React, { useContext } from 'react';

import Linkd from '../Button/Button';
import { IconLogout } from '../../assets/icons';
import styles from './LogoutLink.module.scss';
import { SessionContext } from '../../SessionState';
import { ComponentChildren } from '../../../universal/types/App.types';
import { LOGOUT_URL } from '../../config/api';

interface LogoutLinkProps {
  children: ComponentChildren;
}

export default function LogoutLink({ children }: LogoutLinkProps) {
  const session = useContext(SessionContext);
  return (
    <Linkd
      onClick={event => {
        event.preventDefault();
        session.logout();
        return false;
      }}
      lean={true}
      className={styles.LogoutLink}
      icon={IconLogout}
      href={LOGOUT_URL}
    >
      {children}
    </Linkd>
  );
}
