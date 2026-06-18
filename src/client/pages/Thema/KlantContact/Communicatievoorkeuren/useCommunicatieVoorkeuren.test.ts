import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useSetCommunicatievoorkeur,
  useVerifyCommunicatievoorkeur,
  useCommunicatieVoorkeurVerwijderen,
} from './useCommunicatieVoorkeuren.ts';
import type { KlantcontactResponseData } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { remoteApiHost } from '../../../../../testing/setup.ts';
import { remoteApi } from '../../../../../testing/utils.ts';
import type { ApiResponse } from '../../../../../universal/helpers/api.ts';
import { BFFApiUrls } from '../../../../config/api.ts';
import { useAppStateStore } from '../../../../hooks/useAppStateStore.ts';

const ORIGINAL_URLS = {
  create: BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_CREATE,
  verify: BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_VERIFY,
  delete: BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_DELETE,
};

const TEST_URLS = {
  create: `${remoteApiHost}/services/klantcontact/contactgegeven/create`,
  verify: `${remoteApiHost}/services/klantcontact/contactgegeven/verify`,
  delete: `${remoteApiHost}/services/klantcontact/contactgegeven/delete`,
};

function getContactgegevenInStore(
  type: 'Email' | 'Telefoonnummer' | 'Postadres'
) {
  return useAppStateStore.getState().KLANT_CONTACT?.content
    ?.communicatievoorkeuren?.standaardContactgegevens?.[type];
}

describe('useCommunicatieVoorkeuren', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Route this suite through the nock remoteApi helper.
    Object.assign(BFFApiUrls as Record<string, string>, {
      KLANTCONTACT_CONTACTGEGEVEN_CREATE: TEST_URLS.create,
      KLANTCONTACT_CONTACTGEGEVEN_VERIFY: TEST_URLS.verify,
      KLANTCONTACT_CONTACTGEGEVEN_DELETE: TEST_URLS.delete,
    });

    useAppStateStore.setState({
      KLANT_CONTACT: {
        content: {
          communicatievoorkeuren: {
            standaardContactgegevens: {},
          },
        },
      } as ApiResponse<KlantcontactResponseData>,
    });
  });

  afterEach(() => {
    vi.useRealTimers();

    // Restore URL constants for other suites.
    Object.assign(BFFApiUrls as Record<string, string>, {
      KLANTCONTACT_CONTACTGEGEVEN_CREATE: ORIGINAL_URLS.create,
      KLANTCONTACT_CONTACTGEGEVEN_VERIFY: ORIGINAL_URLS.verify,
      KLANTCONTACT_CONTACTGEGEVEN_DELETE: ORIGINAL_URLS.delete,
    });
  });

  it('useSetCommunicatievoorkeur updates app state when create succeeds with id', async () => {
    const callback = vi.fn();
    const created = {
      id: 'cg-1',
      type: 'Email',
      value: 'test@example.com',
      isVerified: false,
    };

    remoteApi.post('/services/klantcontact/contactgegeven/create').reply(200, {
      status: 'OK',
      content: created,
    });

    const { result } = renderHook(() => useSetCommunicatievoorkeur(callback));

    await act(async () => {
      await result.current.fetch({
        payload: { type: 'Email', value: 'test@example.com' },
      });
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining(created),
      true
    );
    expect(getContactgegevenInStore('Email')).toEqual(
      expect.objectContaining(created)
    );
  });

  it('useSetCommunicatievoorkeur does not update app state when response has no id', async () => {
    const callback = vi.fn();

    remoteApi.post('/services/klantcontact/contactgegeven/create').reply(200, {
      status: 'OK',
      content: {
        id: null,
        type: 'Email',
      },
    });

    const { result } = renderHook(() => useSetCommunicatievoorkeur(callback));

    await act(async () => {
      await result.current.fetch({
        payload: { type: 'Email', value: 'test@example.com' },
      });
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: null, type: 'Email' }),
      true
    );
    expect(getContactgegevenInStore('Email')).toBeUndefined();
  });

  it('useVerifyCommunicatievoorkeur updates app state when verified', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T12:00:00.000Z'));

    const callback = vi.fn();

    remoteApi.post('/services/klantcontact/contactgegeven/verify').reply(200, {
      status: 'OK',
      content: { verified: true },
    });

    const { result } = renderHook(() =>
      useVerifyCommunicatievoorkeur(callback)
    );

    await act(async () => {
      await result.current.fetch({
        payload: { type: 'Email', value: 'test@example.com', code: '1234' },
      });
    });

    expect(callback).toHaveBeenCalledWith(true);
    expect(getContactgegevenInStore('Email')).toEqual(
      expect.objectContaining({
        type: 'Email',
        isVerified: true,
        dateModified: '2026-01-02T12:00:00.000Z',
      })
    );
  });

  it('useVerifyCommunicatievoorkeur does not update app state when not verified', async () => {
    const callback = vi.fn();

    remoteApi.post('/services/klantcontact/contactgegeven/verify').reply(200, {
      status: 'OK',
      content: { verified: false },
    });

    const { result } = renderHook(() =>
      useVerifyCommunicatievoorkeur(callback)
    );

    await act(async () => {
      await result.current.fetch({
        payload: { type: 'Email', value: 'test@example.com', code: '1234' },
      });
    });

    expect(callback).toHaveBeenCalledWith(false);
    expect(getContactgegevenInStore('Email')).toBeUndefined();
  });

  it('useCommunicatieVoorkeurVerwijderen clears value in app state when delete succeeds', async () => {
    useAppStateStore.setState({
      KLANT_CONTACT: {
        content: {
          communicatievoorkeuren: {
            standaardContactgegevens: {
              Email: {
                id: 'cg-1',
                type: 'Email',
                value: 'test@example.com',
                isVerified: true,
                dateModified: '2026-01-02T12:00:00.000Z',
                dateModifiedFormatted: '2 januari 2026',
              },
            },
          },
        },
      } as ApiResponse<KlantcontactResponseData>,
    });

    remoteApi.post('/services/klantcontact/contactgegeven/delete').reply(200, {
      status: 'OK',
      content: null,
    });

    const contactgegeven = {
      id: 'cg-1',
      type: 'Email',
      value: 'test@example.com',
    };

    const { result } = renderHook(() =>
      useCommunicatieVoorkeurVerwijderen(contactgegeven as never)
    );

    await act(async () => {
      await result.current();
    });

    expect(getContactgegevenInStore('Email')).toEqual(
      expect.objectContaining({
        type: 'Email',
        value: null,
        id: null,
        dateModified: null,
        dateModifiedFormatted: null,
      })
    );
  });

  it('useCommunicatieVoorkeurVerwijderen does not update app state when delete fails', async () => {
    useAppStateStore.setState({
      KLANT_CONTACT: {
        content: {
          communicatievoorkeuren: {
            standaardContactgegevens: {
              Email: {
                id: 'cg-1',
                type: 'Email',
                value: 'test@example.com',
                dateModified: null,
                dateModifiedFormatted: null,
              },
            },
          },
        },
      } as ApiResponse<KlantcontactResponseData>,
    });

    remoteApi.post('/services/klantcontact/contactgegeven/delete').reply(200, {
      status: 'ERROR',
      message: 'Delete failed',
      content: null,
    });

    const contactgegeven = {
      id: 'cg-1',
      type: 'Email',
      value: 'test@example.com',
    };

    const { result } = renderHook(() =>
      useCommunicatieVoorkeurVerwijderen(contactgegeven as never)
    );

    await act(async () => {
      await result.current();
    });

    expect(getContactgegevenInStore('Email')).toEqual(
      expect.objectContaining({
        id: 'cg-1',
        type: 'Email',
        value: 'test@example.com',
      })
    );
  });
});
