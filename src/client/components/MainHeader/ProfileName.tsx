import styles from './MainHeader.module.scss';
import { isLoading } from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import LoadingContent from '../LoadingContent/LoadingContent';

type ProfileNameProps = {
  fallbackName: string;
};

export function ProfileName({ fallbackName }: ProfileNameProps) {
  const { BRP, KVK } = useAppStateGetter();
  const profileType = useProfileTypeValue();

  const persoon = BRP.content?.persoon;

  const labelCommercial = KVK.content?.onderneming.handelsnaam || fallbackName;
  const labelPrivate = persoon?.opgemaakteNaam
    ? persoon.opgemaakteNaam
    : persoon?.voornamen
      ? getFullName(persoon)
      : fallbackName;
  return (
    <>
      {profileType === 'private' && !isLoading(BRP) && labelPrivate}
      {profileType === 'commercial' && !isLoading(KVK) && labelCommercial}
      {((profileType === 'commercial' && isLoading(KVK)) ||
        (profileType === 'private' && isLoading(BRP))) && (
        <LoadingContent
          className={styles.ProfileNameLoader}
          barConfig={[['200px', '20px', '0']]}
        />
      )}
    </>
  );
}
