import { ZaakStatus } from './ZaakStatus.tsx';
import { ZAAK_STATUS_ROUTE } from './ZaakStatus-config.ts';

export const ZaakStatusRoute = {
  route: ZAAK_STATUS_ROUTE,
  Component: ZaakStatus,
};
export const ZaakStatusRoutes = [ZaakStatusRoute];

export const ZAAK_STATUS_PAGE_DOCUMENT_TITLE =
  'Status van uw Zaak | Mijn Amsterdam';
