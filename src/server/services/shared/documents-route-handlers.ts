import z from 'zod';

import { decryptPayloadAndValidateSessionID } from './decrypt-route-param.ts';
import {
  getDocumentsProvider,
  type DocumentsProvider,
} from './document-provider-registry.ts';
import { isOpsEnabled } from '../../config/azure-appconfiguration.ts';
import type { RequestWithQueryParams } from '../../routing/route-helpers.ts';
import {
  sendBadRequest,
  sendDocumentDownloadResponse,
  sendResponse,
  sendServiceUnavailable,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';

type DocumentsPayloadBase = {
  domainService: string;
  source: string;
};

type DocumentsResolvedContext<
  TPayload extends DocumentsPayloadBase,
> = {
  payload: TPayload;
  provider: DocumentsProvider;
};

function resolveDocumentsContext<
  TPayload extends DocumentsPayloadBase,
>(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated,
  payloadSchema: z.ZodType<TPayload>
): DocumentsResolvedContext<TPayload> | null {
  const decryptResult = decryptPayloadAndValidateSessionID<
    Record<string, unknown>
  >(req.query.id, res.locals.authProfileAndToken);

  if (decryptResult.status === 'ERROR') {
    sendResponse(res, decryptResult);
    return null;
  }

  const payloadResult = payloadSchema.safeParse(decryptResult.content.payload);

  if (!payloadResult.success) {
    sendBadRequest(res, 'Invalid shared documents payload');
    return null;
  }

  const provider = getDocumentsProvider(
    payloadResult.data.domainService,
    payloadResult.data.source
  );

  if (!provider) {
    sendBadRequest(
      res,
      `No shared documents provider for ${payloadResult.data.domainService}/${payloadResult.data.source}`
    );
    return null;
  }

  if (!isOpsEnabled(provider.opsToggleKey)) {
    sendServiceUnavailable(res, `${provider.opsToggleKey} is disabled`);
    return null;
  }

  return {
    payload: payloadResult.data,
    provider,
  };
}

const DocumentsListPayloadSchema = z.object({
  domainService: z.string(),
  source: z.string(),
  zaakKey: z.string(),
});

export async function handleFetchDocumentsList(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated
) {
  const context = resolveDocumentsContext(
    req,
    res,
    DocumentsListPayloadSchema
  );

  if (!context) {
    return;
  }

  const response = await context.provider.listDocuments(
    res.locals.authProfileAndToken,
    context.payload
  );

  return sendResponse(res, response);
}

const DocumentsDownloadPayloadSchema = z.object({
  domainService: z.string(),
  source: z.string(),
  documentKey: z.string(),
});

export async function handleFetchDocumentDownload(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated
) {
  const context = resolveDocumentsContext(
    req,
    res,
    DocumentsDownloadPayloadSchema
  );

  if (!context) {
    return;
  }

  const response = await context.provider.downloadDocument(
    res.locals.authProfileAndToken,
    context.payload
  );

  return sendDocumentDownloadResponse(res, response);
}
