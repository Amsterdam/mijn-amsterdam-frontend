import { NextFunction, Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { getAuth } from '../../helpers/app';
import { captureException } from '../monitoring';
import { fetchDocument } from './zorgned-service';

export function downloadZorgnedDocument(
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  return async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const authProfileAndToken = await getAuth(req);

    let documentId: string = '';
    let sessionID: string = '';

    try {
      [sessionID, documentId] = decrypt(req.params.id).split(':');
    } catch (error) {
      captureException(error);
    }

    if (!documentId || sessionID !== authProfileAndToken.profile.sid) {
      return apiErrorResult('Not authorized', null, 401);
    }

    const documentResponse = await fetchDocument(
      res.locals.requestID,
      authProfileAndToken,
      zorgnedApiConfigKey,
      documentId
    );

    if (
      documentResponse.status === 'ERROR' ||
      !documentResponse.content?.data
    ) {
      return res.status(500).send(documentResponse);
    }

    res.type(documentResponse.content.mimetype ?? 'application/pdf');
    res.header(
      'Content-Disposition',
      `attachment; filename="${documentResponse.content.title}.pdf"`
    );
    return res.send(documentResponse.content.data);
  };
}
