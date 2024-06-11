import { Icon } from '@amsterdam/design-system-react';
import { LogoutIcon } from '@amsterdam/design-system-react-icons';
import { isError } from '../../../universal/helpers';
import { LOGOUT_URL } from '../../config/api';
import { useAppStateGetter, useProfileTypeValue } from '../../hooks';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { MaLink } from '../MaLink/MaLink';
import { ProfileName } from './ProfileName';
import styles from './SecondaryLinks.module.scss';

type SecondaryLinksProps = {
  showIcons?: boolean;
};

export function SecondaryLinks({ showIcons = false }: SecondaryLinksProps) {
  const { BRP, KVK, PROFILE } = useAppStateGetter();
  const session = useSessionValue();

  const profileType = useProfileTypeValue();

  return (
    <>
      <MaLink
        maVariant="noDefaultUnderline"
        href={LOGOUT_URL}
        className={styles.SecondaryLink}
        onClick={(event) => {
          event.preventDefault();
          session.logout();
          return false;
        }}
      >
        {showIcons && <Icon svg={LogoutIcon} />}Uitloggen
      </MaLink>
      {!isError(BRP) && !isError(KVK) && (
        <ProfileName
          showIcons={showIcons}
          className={styles.SecondaryLink}
          person={BRP.content?.persoon}
          company={KVK.content}
          profileType={profileType}
          profileAttribute={PROFILE.content?.profile.id}
        />
      )}
    </>
  );
}
