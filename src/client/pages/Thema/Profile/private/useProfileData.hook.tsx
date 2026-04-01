import {
  formatBrpProfileData,
  type BrpProfileData,
} from './ProfilePrivate.transform.tsx';
import { useIngeschrevenPersonenOpAdres } from './useAantalIngeschrevenPersonen.hook.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useProfileData() {
  const { BRP } = useAppStateGetter();
  const aantalIngeschrevenPersonen = useIngeschrevenPersonenOpAdres(
    BRP.content?.fetchUrlAantalIngeschrevenPersonen ?? null
  );

  let profileData: BrpProfileData | null;

  if (typeof aantalIngeschrevenPersonen === 'string' && BRP.content?.adres) {
    const brpContent = {
      ...BRP.content,
      adres: {
        ...BRP.content.adres,
        aantalIngeschrevenPersonen,
      },
    };
    profileData = formatBrpProfileData(brpContent);
  } else {
    profileData = BRP.content ? formatBrpProfileData(BRP.content) : BRP.content;
  }

  return {
    BRP,
    profileData,
    aantalIngeschrevenPersonen,

    themaConfig,
  };
}
