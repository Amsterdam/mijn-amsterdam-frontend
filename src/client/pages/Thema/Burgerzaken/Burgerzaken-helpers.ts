import { generatePath } from 'react-router';

import { routeConfig, themaTitle } from './Burgerzaken-thema-config';
import { AppState } from '../../../../universal/types/App.types';

export function getThemaTitleBurgerzaken(
  hasIDKaart: boolean,
  hasPaspoort: boolean
) {
  switch (true) {
    default:
    case hasIDKaart && hasPaspoort:
      return themaTitle;
    case hasIDKaart:
      return 'ID-kaart';
    case hasPaspoort:
      return 'Paspoort';
  }
}

export function getThemaTitleBurgerzakenWithAppState(appState: AppState) {
  const hasIDKaart = !!appState.BRP?.content?.identiteitsbewijzen?.some(
    (x) => x.documentType == 'europese identiteitskaart'
  );
  const hasPaspoort = !!appState.BRP?.content?.identiteitsbewijzen?.some(
    (x) => x.documentType == 'paspoort'
  );

  return getThemaTitleBurgerzaken(hasIDKaart, hasPaspoort);
}

export function getThemaUrlBurgerzakenWithAppState(appState: AppState) {
  const identiteitsbewijzen = appState.BRP?.content?.identiteitsbewijzen ?? [];
  const identiteitsbewijs = identiteitsbewijzen[0];

  return identiteitsbewijzen.length === 1 && identiteitsbewijs
    ? generatePath(routeConfig.detailPage.path, {
        documentType: identiteitsbewijs.documentType,
        id: identiteitsbewijs.id,
      })
    : routeConfig.themaPage.path;
}
