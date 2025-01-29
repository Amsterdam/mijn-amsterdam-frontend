import { describe, it, expect, vi, Mock } from 'vitest';

import { fetchDecosDocumentsList } from './decos-route-handlers';
import { fetchDecosDocumentList } from './decos-service';
import {
  getAuthProfileAndToken,
  RequestMock,
  ResponseMock,
} from '../../../testing/utils';
import { getAuth } from '../../auth/auth-helpers';
import { RequestWithQueryParams } from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

vi.mock('../decos/decos-service');
vi.mock('../../auth/auth-helpers');
vi.mock('../shared/decrypt-route-param');

const mockValues = vi.hoisted(() => {
  return {
    idEncrypted: 'test-encrypted-id',
    sessionId: 'session-id',
    id: 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encryptSessionIdWithRouteIdParam: () => {
      return mockValues.idEncrypted;
    },
    decrypt: () => `${mockValues.sessionId}:${mockValues.id}`,
  };
});

describe('fetchVergunningDocumentsList', () => {
  const mockDocumentsResponse = {
    status: 'OK',
    content: [
      { id: 1, name: 'Document 1' },
      { id: 2, name: 'Document 2' },
    ],
  };

  const req = RequestMock.new().setQuery({ id: mockValues.idEncrypted }).get();

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a list of vergunning documents', async () => {
    (getAuth as Mock).mockReturnValue(getAuthProfileAndToken('private'));
    (decryptEncryptedRouteParamAndValidateSessionID as Mock).mockReturnValue({
      content: mockValues.id,
      status: 'OK',
    });
    (fetchDecosDocumentList as Mock).mockResolvedValue(mockDocumentsResponse);

    const res = ResponseMock.new();

    await fetchDecosDocumentsList(
      req as RequestWithQueryParams<{ id: string }>,
      res
    );

    expect(fetchDecosDocumentList).toHaveBeenCalledWith(
      res.locals.requestID,
      mockValues.id
    );
    expect(res.send).toHaveBeenCalledWith(mockDocumentsResponse);
  });

  it('should fail if the session id cannot be validated', async () => {
    (getAuth as Mock).mockReturnValue(null);

    const res = ResponseMock.new();

    await fetchDecosDocumentsList(
      req as RequestWithQueryParams<{ id: string }>,
      res
    );

    expect(fetchDecosDocumentList).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return an error if the api fails', async () => {
    (getAuth as Mock).mockReturnValue(getAuthProfileAndToken('private'));
    (decryptEncryptedRouteParamAndValidateSessionID as Mock).mockReturnValue({
      content: mockValues.id,
      status: 'OK',
    });
    (fetchDecosDocumentList as Mock).mockResolvedValue({
      status: 'ERROR',
      message: 'Failed to fetch',
      code: 500,
      content: null,
    });

    const res = ResponseMock.new();

    await fetchDecosDocumentsList(
      req as RequestWithQueryParams<{ id: string }>,
      res
    );

    expect(fetchDecosDocumentList).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
