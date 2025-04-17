import { useEffect } from 'react';

import { FeatureToggle } from '../../../../../universal/config/feature-toggles';
import {
  apiPristineResult,
  ApiResponse_DEPRECATED,
} from '../../../../../universal/helpers/api';
import { AppState } from '../../../../../universal/types';
import { useDataApi } from '../../../../hooks/api/useDataApi';

export function useAantalBewonersOpAdres(
  brpContent: AppState['BRP']['content']
) {
  const [{ data: residentData }, fetchResidentCount] = useDataApi<
    ApiResponse_DEPRECATED<{ residentCount: number }>
  >(
    {
      url: brpContent?.fetchUrlAantalBewoners ?? '',
      postpone: true,
    },
    apiPristineResult({ residentCount: -1 })
  );

  // Fetch the resident count data
  useEffect(() => {
    if (
      FeatureToggle.residentCountActive &&
      brpContent?.adres?._adresSleutel &&
      brpContent?.adres?.landnaam === 'Nederland' &&
      brpContent?.fetchUrlAantalBewoners
    ) {
      fetchResidentCount({
        url: brpContent?.fetchUrlAantalBewoners ?? '',
      });
    }
  }, [brpContent, fetchResidentCount]);

  const residentCount = residentData?.content?.residentCount;

  return residentCount;
}
