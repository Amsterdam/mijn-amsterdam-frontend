import { isLoading } from '../../../universal/helpers/api.ts';
import { getFullName } from '../../../universal/helpers/brp.ts';
import { useAppStateGetter } from '../../hooks/useAppStateStore.ts';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';
import type { BarConfig } from '../LoadingContent/LoadingContent.tsx';
import LoadingContent from '../LoadingContent/LoadingContent.tsx';

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

  if (
    (profileType === 'private' && isLoading(BRP)) ||
    (profileType === 'commercial' && isLoading(KVK))
  ) {
    return <LoadingContent barConfig={loaderBarConfig} />;
  }

  if (BRP.content?.persoon) {
    const persoon = BRP.content.persoon;

    if (preferVoornaam && persoon.voornamen) {
      return persoon.voornamen;
    } else if (persoon.opgemaakteNaam) {
      return persoon.opgemaakteNaam;
    } else if (persoon.voornamen) {
      return getFullName(persoon);
    }
  } else if (KVK.content?.onderneming?.handelsnaam) {
    return KVK.content.onderneming.handelsnaam;
  }
  return fallbackName;
}
