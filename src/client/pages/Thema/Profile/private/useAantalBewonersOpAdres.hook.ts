import { useEffect } from 'react';

import { FeatureToggle } from '../../../../../universal/config/feature-toggles';
import { AppState } from '../../../../../universal/types/App.types';
import { createGetApiHook } from '../../../../hooks/api/useDataApi-v2';

const useResidentsCountApi = createGetApiHook<{ residentCount: number }>();

export function useAantalBewonersOpAdres(
  brpContent: AppState['BRP']['content']
) {
  const { data, fetch } = useResidentsCountApi();

  // Fetch the resident count data
  useEffect(() => {
    if (
      FeatureToggle.residentCountActive &&
      brpContent?.adres?._adresSleutel &&
      brpContent?.adres?.landnaam === 'Nederland' &&
      brpContent?.fetchUrlAantalBewoners
    ) {
      fetch(brpContent.fetchUrlAantalBewoners);
    }
  }, [brpContent, fetch]);

  const residentCount = data?.content?.residentCount;

  return residentCount;
}
