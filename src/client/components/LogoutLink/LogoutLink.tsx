import React from 'react';
import { ComponentChildren } from '../../../universal/types/App.types';
import { IconLogout } from '../../assets/icons';
import { LOGOUT_URL } from '../../config/api';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import Linkd from '../Button/Button';
import styles from './LogoutLink.module.scss';

interface LogoutLinkProps {
  children: ComponentChildren;
}

export default function LogoutLink({ children }: LogoutLinkProps) {
  const session = useSessionValue();
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
