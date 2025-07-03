import { describe, it, expect, vi, Mock } from 'vitest';

import { decryptEncryptedRouteParamAndValidateSessionID } from './decrypt-route-param';
import { downloadDocumentRouteHandler } from './document-download-route-handler';
import { RequestMock, ResponseMock } from '../../../testing/utils';
import { getAuth } from '../../auth/auth-helpers';
import { sendResponse, sendUnauthorized } from '../../routing/route-helpers';
import { Buffer } from "node:buffer";

vi.mock('../../auth/auth-helpers', () => ({
  getAuth: vi.fn(),
}));

vi.mock('./decrypt-route-param', () => ({
  decryptEncryptedRouteParamAndValidateSessionID: vi.fn(),
}));

vi.mock('../../routing/route-helpers', async (importOriginal) => ({
  ...(await importOriginal()),
  sendResponse: vi.fn(),
  sendUnauthorized: vi.fn(),
}));

describe('document-download-route-handler', () => {
  it('should handle a successful document fetch', async () => {
    const fetchDocument = vi.fn().mockResolvedValue({
      status: 'OK',
      content: {
        data: Buffer.from('test'),
        mimetype: 'application/pdf',
        filename: 'test.pdf',
      },
    });

    const req = RequestMock.new();
    const res = ResponseMock.new();

    (getAuth as Mock).mockReturnValue({ profile: { sid: 'test-sid' } });
    (decryptEncryptedRouteParamAndValidateSessionID as Mock).mockReturnValue({
      status: 'OK',
      content: 'decrypted-id',
    });

    const handler = downloadDocumentRouteHandler(fetchDocument);
    await handler(req, res);

    expect(fetchDocument).toHaveBeenCalledWith(
      { profile: { sid: 'test-sid' } },
      'decrypted-id',
      req.query
    );
    expect(res.type).toHaveBeenCalledWith('application/pdf');
    expect(res.header).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename*="test.pdf"'
    );
    expect(res.send).toHaveBeenCalledWith(Buffer.from('test'));
  });

  it('should handle a filename with non-ASCII characters and spaces', async () => {
    const fetchDocument = vi.fn().mockResolvedValue({
      status: 'OK',
      content: {
        data: Buffer.from('test'),
        mimetype: 'application/pdf',
        filename: 'test file riëlé.pdf',
      },
    });

    const req = RequestMock.new()
      .setQuery({ id: 'encrypted-id' })
      .setParams({ id: 'encrypted-id' });
    const res = ResponseMock.new();

    (getAuth as Mock).mockReturnValue({ profile: { sid: 'test-sid' } });
    (decryptEncryptedRouteParamAndValidateSessionID as Mock).mockReturnValue({
      status: 'OK',
      content: 'decrypted-id',
    });

    const handler = downloadDocumentRouteHandler(fetchDocument);
    await handler(req, res);

    expect(fetchDocument).toHaveBeenCalledWith(
      { profile: { sid: 'test-sid' } },
      'decrypted-id',
      req.query
    );
    expect(res.type).toHaveBeenCalledWith('application/pdf');
    expect(res.header).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename*="test%20file%20ri%C3%ABl%C3%A9.pdf"'
    );
    expect(res.send).toHaveBeenCalledWith(Buffer.from('test'));
  });

  it('should handle a document fetch without a filename', async () => {
    const fetchDocument = vi.fn().mockResolvedValue({
      status: 'OK',
      content: {
        data: Buffer.from('test'),
        mimetype: 'application/pdf',
      },
    });

    const req = RequestMock.new()
      .setQuery({ id: 'encrypted-id' })
      .setParams({ id: 'encrypted-id' });
    const res = ResponseMock.new();

    (getAuth as Mock).mockReturnValue({ profile: { sid: 'test-sid' } });
    (decryptEncryptedRouteParamAndValidateSessionID as Mock).mockReturnValue({
      status: 'OK',
      content: 'decrypted-id',
    });

    const handler = downloadDocumentRouteHandler(fetchDocument);
    await handler(req, res);

    expect(fetchDocument).toHaveBeenCalledWith(
      { profile: { sid: 'test-sid' } },
      'decrypted-id',
      req.query
    );
    expect(res.type).toHaveBeenCalledWith('application/pdf');
    expect(res.header).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment'
    );
    expect(res.send).toHaveBeenCalledWith(Buffer.from('test'));
  });

  it('should handle an error document fetch', async () => {
    const fetchDocument = vi.fn().mockResolvedValue({
      status: 'ERROR',
      content: null,
    });

    const req = RequestMock.new();
    const res = ResponseMock.new();

    (getAuth as Mock).mockReturnValue({ profile: { sid: 'test-sid' } });
    (decryptEncryptedRouteParamAndValidateSessionID as Mock).mockReturnValue({
      status: 'OK',
      content: 'decrypted-id',
    });

    const handler = downloadDocumentRouteHandler(fetchDocument);
    await handler(req, res);

    expect(fetchDocument).toHaveBeenCalledWith(
      { profile: { sid: 'test-sid' } },
      'decrypted-id',
      req.query
    );
    expect(sendResponse).toHaveBeenCalledWith(res, {
      status: 'ERROR',
      content: null,
    });
  });

  it('should handle an unauthorized request', async () => {
    const fetchDocument = vi.fn();

    const req = RequestMock.new();
    const res = ResponseMock.new();

    (getAuth as Mock).mockReturnValue(null);

    const handler = downloadDocumentRouteHandler(fetchDocument);
    await handler(req, res);

    expect(fetchDocument).not.toHaveBeenCalled();
    expect(sendUnauthorized).toHaveBeenCalledWith(res);
  });
});
