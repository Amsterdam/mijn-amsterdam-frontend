import { FeatureToggle } from '../../../../../universal/config/feature-toggles';
import { AppState } from '../../../../../universal/types/App.types';
import { useBffApi } from '../../../../hooks/api/useBffApi';

export function useAantalBewonersOpAdres(
  brpContent: AppState['BRP']['content']
) {
  const url =
    FeatureToggle.residentCountActive &&
    brpContent?.adres?._adresSleutel &&
    brpContent?.adres?.landnaam === 'Nederland' &&
    brpContent?.fetchUrlAantalBewoners
      ? brpContent.fetchUrlAantalBewoners
      : null;
  const { data } = useBffApi<{ residentCount: number }>(url);
  const residentCount = data?.content?.residentCount;

  return residentCount;
}
