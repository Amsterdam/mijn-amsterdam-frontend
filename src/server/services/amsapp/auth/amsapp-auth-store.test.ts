import {
  createAmsAppAuthRepository,
  createLoginAttempt,
  getByLoginId,
} from './amsapp-auth-store.ts';

describe('AMS app auth repository', () => {
  test('non-production selection preserves the memory-backed login flow', async () => {
    const repository = createAmsAppAuthRepository(false);
    await repository.clearAmsAppAuthStore();

    const loginId = await createLoginAttempt('code-challenge');
    expect(await repository.getByLoginId(loginId)).toMatchObject({
      status: 'pending',
      codeChallenge: 'code-challenge',
    });

    const record = await repository.markLoginReady(loginId, 'session-token');
    expect(record?.authorizationCode).toEqual(expect.any(String));
    const authorizationCode = record!.authorizationCode!;

    expect(await repository.getByAuthorizationCode(authorizationCode)).toBe(
      record
    );
    expect(await repository.consumeByAuthorizationCode(authorizationCode)).toBe(
      record
    );
    expect(await getByLoginId(loginId)).toBeNull();
    expect(
      await repository.consumeByAuthorizationCode(authorizationCode)
    ).toBeNull();

    await repository.clearAmsAppAuthStore();
  });

  const productionRepository = createAmsAppAuthRepository(true);
  const productionOperations = {
    createLoginAttempt: () =>
      productionRepository.createLoginAttempt('challenge'),
    markLoginReady: () =>
      productionRepository.markLoginReady('login-id', 'token'),
    getByAuthorizationCode: () =>
      productionRepository.getByAuthorizationCode('code'),
    consumeByAuthorizationCode: () =>
      productionRepository.consumeByAuthorizationCode('code'),
    getByLoginId: () => productionRepository.getByLoginId('login-id'),
    clearAmsAppAuthStore: () => productionRepository.clearAmsAppAuthStore(),
    revokeSessionToken: () => productionRepository.revokeSessionToken('token'),
    isSessionTokenRevoked: () =>
      productionRepository.isSessionTokenRevoked('token'),
  };

  test.each(Object.entries(productionOperations))(
    'production %s rejects without a memory fallback',
    async (_operationName, operation) => {
      await expect(operation()).rejects.toThrow(
        'AMS app auth database layer not implemented'
      );
    }
  );
});
