import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types/App.types';
import { ThemaTitles } from '../../config/thema';

const routeByDocumentType: Record<string, string> = {
  paspoort: AppRoutes['BURGERZAKEN/PASPOORT'],
  'europese identiteitskaart': AppRoutes['BURGERZAKEN/ID-KAART'],
};

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

export function getThemaUrlBurgerzakenWithAppState(appState: AppState) {
  const identiteitsbewijzen = appState.BRP?.content?.identiteitsbewijzen ?? [];
  const identiteitsbewijs = identiteitsbewijzen[0];

  return identiteitsbewijzen.length === 1 && identiteitsbewijs
    ? generatePath(routeByDocumentType[identiteitsbewijs.documentType], {
        id: identiteitsbewijs.id,
      })
    : AppRoutes.BURGERZAKEN;
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
