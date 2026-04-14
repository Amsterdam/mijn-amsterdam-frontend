import {
  formatBrpProfileData,
  type BrpProfileData,
} from './ProfilePrivate.transform.tsx';
import { useIngeschrevenPersonenOpAdres } from './useAantalIngeschrevenPersonen.hook.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useProfileData() {
  const { BRP, WONEN } = useAppStateGetter();
  const aantalIngeschrevenPersonen = useIngeschrevenPersonenOpAdres(
    BRP.content?.fetchUrlAantalIngeschrevenPersonen ?? null
  );

  let profileData: BrpProfileData | null;

  if (!BRP.content) {
    profileData = null;
  } else if (!BRP.content.adres) {
    profileData = formatBrpProfileData(BRP.content);
  } else {
    const brpContent = {
      ...BRP.content,
      adres: {
        ...BRP.content.adres,
        vveNaam: WONEN?.content?.vve?.name,
        aantalIngeschrevenPersonen,
      },
    };
    profileData = formatBrpProfileData(brpContent);
  }

  return {
    BRP,
    profileData,
    aantalIngeschrevenPersonen,

    themaConfig,
  };
}
