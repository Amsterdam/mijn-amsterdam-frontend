import {
  IdentiteitsbewijsFromSource,
  Identiteitsbewijs,
} from '../../../universal/types';
import { AppState } from '../../../universal/types/App.types';
import { ThemaTitles } from '../../config/thema';

function getThemaTitleConditions( //deze hoeft niet wanneer ik het daaronder aan de praat krijg regel 36 en 37
  hasIDKaart: boolean,
  hasPaspoort: boolean,
  document: IdentiteitsbewijsFromSource
) {
  if (document.documentType === 'europese identiteitskaart') {
    hasIDKaart === true;
  } else if (document.documentType === 'paspoort') {
    hasPaspoort === true;
  } else return ThemaTitles.BURGERZAKEN;
}

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
