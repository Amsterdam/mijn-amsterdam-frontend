import styles from './MainHeader.module.scss';
import { isLoading } from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent';

type ProfileNameProps = {
  fallbackName: string;
  loaderBarConfig?: BarConfig;
};

export function ProfileName({
  fallbackName,
  loaderBarConfig = [['200px', '20px', '0']],
}: ProfileNameProps) {
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
          barConfig={loaderBarConfig}
        />
      )}
    </>
  );
}
