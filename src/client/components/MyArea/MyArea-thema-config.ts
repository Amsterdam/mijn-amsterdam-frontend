import { ThemaRoutesConfig } from '../../config/thema-types';
import { toDocumentTitles, toRoutes } from '../../helpers/thema-config';

export const themaId = 'BUURT' as const;

export const featureToggle = {
  // Meldingen dataset op de kaart
  meldingenBuurtActive: true,
  wiorDatasetActive: true,
  wiorMeldingen: true,
  laadpalenActive: false,
  bekendmakingenDatasetActive: false,
  evenementenDatasetActive: false,
  sportDatasetsActive: true,
} as const;

export const themaTitle = 'Mijn buurt' as const;

export const routeConfig = {
  themaPage: {
    path: '/buurt',
    documentTitle: themaTitle,
  },
} as const satisfies ThemaRoutesConfig;

export const routes = toRoutes(routeConfig);
export const documentTitles = toDocumentTitles(routeConfig);

export const errorMessage = 'Mijn buurt / Mijn bedrijfsomgeving';
