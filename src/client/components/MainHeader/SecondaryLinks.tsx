import { isError } from '../../../universal/helpers';
import { LOGOUT_URL } from '../../config/api';
import { useAppStateGetter, useProfileTypeValue } from '../../hooks';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { MaLink } from '../MaLink/MaLink';
import { ProfileName } from './ProfileName';

export function SecondaryLinks() {
  const { BRP, KVK, PROFILE } = useAppStateGetter();
  const session = useSessionValue();

  const profileType = useProfileTypeValue();

  return (
    <>
      <MaLink
        maVariant="noDefaultUnderline"
        href={LOGOUT_URL}
        onClick={(event) => {
          event.preventDefault();
          session.logout();
          return false;
        }}
      >
        Uitloggen
      </MaLink>
      {!isError(BRP) && !isError(KVK) && (
        <ProfileName
          person={BRP.content?.persoon}
          company={KVK.content}
          profileType={profileType}
          profileAttribute={PROFILE.content?.profile.id}
        />
      )}
    </>
  );
}
