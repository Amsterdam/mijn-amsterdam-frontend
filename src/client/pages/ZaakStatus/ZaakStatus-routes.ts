import { ZaakStatus } from './ZaakStatus';
import { ZAAK_STATUS_ROUTE } from './ZaakStatus-config';

export const ZaakStatusRoute = {
  route: ZAAK_STATUS_ROUTE,
  Component: ZaakStatus,
};
export const ZaakStatusRoutes = [ZaakStatusRoute];

export const ZAAK_STATUS_PAGE_DOCUMENT_TITLE =
  'Status van uw Zaak | Mijn Amsterdam';
