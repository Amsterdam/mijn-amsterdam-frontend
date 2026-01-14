import {
  formatBrpProfileData,
  type BrpProfileData,
} from './ProfilePrivate.transform';
import { useAantalBewonersOpAdres } from './useAantalBewonersOpAdres.hook';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore';
import { routeConfig } from '../Profile-thema-config';
export function useProfileData() {
  const { BRP, WONEN } = useAppStateGetter();
  const aantalBewoners = useAantalBewonersOpAdres(
    BRP.content?.fetchUrlAantalBewoners ?? null
  );

  let profileData: BrpProfileData | null;

  if (
    typeof aantalBewoners === 'number' &&
    BRP.content?.adres &&
    WONEN.content?.name
  ) {
    const brpContent = {
      ...BRP.content,
      adres: {
        ...BRP.content.adres,
        vveNaam: WONEN.content?.name,
        aantalBewoners,
      },
    };
    profileData = formatBrpProfileData(brpContent);
  } else {
    profileData = BRP.content ? formatBrpProfileData(BRP.content) : BRP.content;
  }

  return {
    BRP,
    profileData,
    aantalBewoners,
    routeConfig,
  };
}
