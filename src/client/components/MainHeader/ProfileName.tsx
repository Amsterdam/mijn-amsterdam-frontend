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
      const parts = persoon.opgemaakteNaam.split(/\./);
      const voornamen = parts.slice(0, parts.length - 1).join('.');
      const achternaam = parts[parts.length - 1];

      let result = `${voornamen}. ${achternaam}`;

      // Balance this with .ProfileNameInner CSS attribute in MainHeader.module.scss:
      const MAX_CHAR_LENGTH = 33;

      if (result.length > MAX_CHAR_LENGTH) {
        const OVERFLOW_AMOUNT = result.length - MAX_CHAR_LENGTH;
        const cutOffAmount = voornamen.length - OVERFLOW_AMOUNT;

        let shortened = voornamen.slice(0, cutOffAmount < 2 ? 2 : cutOffAmount);

        // Chop off trailing letter like 'W. B' -> 'W.'.
        if (shortened[shortened.length - 1] !== '.') {
          shortened = shortened.slice(0, shortened.length - 1);
        }

        result = `${shortened}${achternaam}`;
      }
      return result;
    } else if (persoon.voornamen) {
      return getFullName(persoon);
    }
  } else if (KVK.content?.onderneming.handelsnaam) {
    return KVK.content.onderneming.handelsnaam;
  }
  return fallbackName;
}
