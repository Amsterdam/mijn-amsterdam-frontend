import { fetchZorgnedDocumentLLV } from './jeugd/route-handlers.ts';
import {
  fetchZorgnedAanvragenWMO,
  fetchZorgnedDocumentWMO,
  fetchZorgnedDocumentsWMO,
} from './jzd-route-handlers.ts';
import { routes } from './jzd-service-config.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import { attachDocumentDownloadRoute } from '../shared/document-download-route-handler.ts';

const jzdRouterProtected = createBFFRouter({ id: 'protected-jzd' });

// LLV Zorgned Doc download
attachDocumentDownloadRoute(
  jzdRouterProtected,
  routes.protected.LLV_DOCUMENT_DOWNLOAD,
  fetchZorgnedDocumentLLV
);

// WMO Zorgned Doc download
attachDocumentDownloadRoute(
  jzdRouterProtected,
  routes.protected.WMO_DOCUMENT_DOWNLOAD,
  fetchZorgnedDocumentWMO
);

jzdRouterProtected.get(
  routes.protected.WMO_AANVRAGEN_RAW,
  fetchZorgnedAanvragenWMO
);
jzdRouterProtected.get(
  routes.protected.WMO_DOCUMENTS_LIST_RAW,
  fetchZorgnedDocumentsWMO
);

export const jzdRouter = {
  protected: jzdRouterProtected,
};
