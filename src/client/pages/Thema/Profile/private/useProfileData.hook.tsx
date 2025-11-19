import { useMemo } from 'react';

import { formatBrpProfileData } from './ProfilePrivate.transform';
import { useAantalBewonersOpAdres } from './useAantalBewonersOpAdres.hook';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore';
import { routeConfig } from '../Profile-thema-config';

export function useProfileData() {
  const { BRP } = useAppStateGetter();
  const aantalBewoners = useAantalBewonersOpAdres(
    BRP.content?.fetchUrlAantalBewoners ?? null
  );

  const profileData = useMemo(() => {
    if (typeof aantalBewoners === 'number' && BRP.content?.adres) {
      const brpContent = {
        ...BRP.content,
        adres: {
          ...BRP.content.adres,
          aantalBewoners,
        },
      };
      return formatBrpProfileData(brpContent);
    }
    return BRP.content ? formatBrpProfileData(BRP.content) : BRP.content;
  }, [BRP.content, aantalBewoners]);

  return {
    BRP,
    profileData,
    aantalBewoners,
    routeConfig,
  };
}
