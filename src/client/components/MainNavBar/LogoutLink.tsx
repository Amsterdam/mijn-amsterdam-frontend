import classNames from 'classnames';
import { ComponentChildren } from '../../../universal/types/App.types';
import { IconLogout } from '../../assets/icons';
import { LOGOUT_URL } from '../../config/api';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { ButtonBody, buttonStyle } from '../Button/Button';
import styles from './ProfileName.module.scss';

interface LogoutLinkProps {
  children: ComponentChildren;
}

export default function LogoutLink({ children }: LogoutLinkProps) {
  const session = useSessionValue();
  return (
    <a
      onClick={(event) => {
        event.preventDefault();
        session.logout();
        return false;
      }}
      className={buttonStyle({
        lean: true,
        isDisabled: false,
        variant: 'plain',
        className: classNames(styles.ProfileLink, styles.LogoutLink),
      })}
      href={LOGOUT_URL}
    >
      <ButtonBody iconPosition="left" icon={IconLogout}>
        {children}
      </ButtonBody>
    </a>
  );
}
