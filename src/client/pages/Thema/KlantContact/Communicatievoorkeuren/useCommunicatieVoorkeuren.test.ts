import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useSetCommunicatievoorkeur,
  useVerifyCommunicatievoorkeur,
  useCommunicatieVoorkeurVerwijderen,
} from './useCommunicatieVoorkeuren.ts';
import type { KlantcontactResponseData } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { bffApiHost } from '../../../../../testing/setup.ts';
import { bffApi } from '../../../../../testing/utils.ts';
import type { ApiResponse } from '../../../../../universal/helpers/api.ts';
import { BFFApiUrls } from '../../../../config/api.ts';
import { useAppStateStore } from '../../../../hooks/useAppStateStore.ts';

const BFF_ENDPOINTS = {
  create: BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_CREATE.replace(
    `${bffApiHost}`,
    ''
  ),
  verify: BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_VERIFY.replace(
    `${bffApiHost}`,
    ''
  ),
  delete: BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_DELETE.replace(
    `${bffApiHost}`,
    ''
  ),
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
  });

  it('useSetCommunicatievoorkeur updates app state when create succeeds with id', async () => {
    const callback = vi.fn();
    const created = {
      id: 'cg-1',
      type: 'Email',
      value: 'test@example.com',
      isVerified: false,
    };

    bffApi.post(BFF_ENDPOINTS.create).reply(200, {
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

    bffApi.post(BFF_ENDPOINTS.create).reply(200, {
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

    bffApi.post(BFF_ENDPOINTS.verify).reply(200, {
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

    bffApi.post(BFF_ENDPOINTS.verify).reply(200, {
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

    bffApi.post(BFF_ENDPOINTS.delete).reply(200, {
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

    bffApi.post(BFF_ENDPOINTS.delete).reply(200, {
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
