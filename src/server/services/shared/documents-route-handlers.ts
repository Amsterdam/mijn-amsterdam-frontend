import z from 'zod';

import { decryptPayloadAndValidateSessionID } from './decrypt-route-param.ts';
import {
  getDocumentsProvider,
  type DocumentsProvider,
} from './document-provider-registry.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { isOpsEnabled } from '../../config/azure-appconfiguration.ts';
import type { RequestWithQueryParams } from '../../routing/route-helpers.ts';
import { serviceUnavailableResponse } from '../../routing/route-helpers.ts';
import {
  badRequestResponse,
  sendDocumentDownloadResponse,
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';

type DocumentsPayloadBase = {
  domainService: string;
  source: string;
};

type DocumentsResolvedContext<TPayload extends DocumentsPayloadBase> = {
  payload: TPayload;
  provider: DocumentsProvider;
};

function resolveDocumentContext<TPayload extends DocumentsPayloadBase>(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated,
  payloadSchema: z.ZodType<TPayload>
): ApiResponse<DocumentsResolvedContext<TPayload>> {
  const decryptResult = decryptPayloadAndValidateSessionID<
    Record<string, unknown>
  >(req.query.id, res.locals.authProfileAndToken);

  if (decryptResult.status === 'ERROR') {
    return decryptResult;
  }

  const payloadResult = payloadSchema.safeParse(decryptResult.content.payload);

  if (!payloadResult.success) {
    return badRequestResponse('Invalid shared documents payload');
  }

  const provider = getDocumentsProvider(
    payloadResult.data.domainService,
    payloadResult.data.source
  );

  if (!provider) {
    return badRequestResponse(
      `No shared documents provider for ${payloadResult.data.domainService}/${payloadResult.data.source}`
    );
  }

  if (!isOpsEnabled(provider.opsToggleKey)) {
    return serviceUnavailableResponse(`${provider.opsToggleKey} is disabled`);
  }

  return apiSuccessResult({
    payload: payloadResult.data,
    provider,
  });
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
  const documentContextResponse = resolveDocumentContext(
    req,
    res,
    DocumentsListPayloadSchema
  );

  if (documentContextResponse.status !== 'OK') {
    return sendResponse(res, documentContextResponse);
  }

  const context = documentContextResponse.content;

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
  const documentContextResponse = resolveDocumentContext(
    req,
    res,
    DocumentsDownloadPayloadSchema
  );

  if (documentContextResponse.status !== 'OK') {
    return sendResponse(res, documentContextResponse);
  }

  const context = documentContextResponse.content;

  const response = await context.provider.downloadDocument(
    res.locals.authProfileAndToken,
    context.payload
  );

  return sendDocumentDownloadResponse(res, response);
}
