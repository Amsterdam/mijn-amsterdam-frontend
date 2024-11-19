import { AppState } from '../../../universal/types/App.types';
import { ThemaTitles } from '../../config/thema';

export function getThemaTitleBurgerzaken(
  hasIDKaart: boolean,
  hasPaspoort: boolean
) {
  switch (true) {
    default:
    case hasIDKaart && hasPaspoort:
      return ThemaTitles.BURGERZAKEN;
    case hasIDKaart:
      return 'ID-kaart';
    case hasPaspoort:
      return 'Paspoort';
  }
}

export function getThemaTitleBurgerzakenWithAppState(appState: AppState) {
  const hasIDKaart = !!appState.BRP?.content?.identiteitsbewijzen?.find(
    (x) => x.documentType == 'identiteitskaart'
  );
  const hasPaspoort = !!appState.BRP?.content?.identiteitsbewijzen?.find(
    (x) => x.documentType == 'paspoort'
  );

  return getThemaTitleBurgerzaken(hasIDKaart, hasPaspoort);
}
