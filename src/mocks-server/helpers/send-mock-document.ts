import type { Response } from 'express';

import { MOCK_DOCUMENT_PATH } from '../settings.ts';

export function sendMockDocument(res: Response, status = 200): void {
  res.status(status).sendFile(MOCK_DOCUMENT_PATH);
}
