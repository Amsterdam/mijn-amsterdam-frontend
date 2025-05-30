import { isLoading } from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent';

type ProfileNameProps = {
  fallbackName: string;
  loaderBarConfig?: BarConfig;
  preferVoornaam?: boolean;
};

export function ProfileName({
  fallbackName,
  loaderBarConfig = [['300px', '20px', '0']],
  preferVoornaam = false,
}: ProfileNameProps) {
  const { BRP, KVK } = useAppStateGetter();
  const profileType = useProfileTypeValue();

  const persoon = BRP.content?.persoon;

  const labelCommercial = KVK.content?.onderneming.handelsnaam || fallbackName;
  let opgemaakteNaam = persoon?.opgemaakteNaam;

  if (opgemaakteNaam) {
    const parts = opgemaakteNaam.split(/\./);
    opgemaakteNaam = `${parts[0].trim()}. ${parts[parts.length - 1].trim()}`;
  }

  const labelPrivate =
    preferVoornaam && persoon?.voornamen
      ? persoon?.voornamen
      : opgemaakteNaam
        ? opgemaakteNaam
        : persoon?.voornamen
          ? getFullName(persoon)
          : fallbackName;
  return (
    <>
      {profileType === 'private' && !isLoading(BRP) && labelPrivate}
      {profileType === 'commercial' && !isLoading(KVK) && labelCommercial}
      {((profileType === 'commercial' && isLoading(KVK)) ||
        (profileType === 'private' && isLoading(BRP))) && (
        <LoadingContent barConfig={loaderBarConfig} />
      )}
    </>
  );
}
