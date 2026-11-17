import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiSuccessResult } from '../../universal/helpers/api.ts';
import type { MyNotification } from '../../universal/types/App.types.ts';
import { useAppStateStore } from './useAppStateStore.ts';
import { useAppStateNotifications } from './useNotifications.ts';
import { useAuthMethodTypeStore } from './useProfileType.ts';

const gpkNotification: MyNotification = {
  id: 'gpk',
  themaID: 'PARKEREN',
  themaTitle: 'Parkeren',
  datePublished: '2026-01-01',
  title: 'GPK-melding',
  description: 'Uw aanvraag is geregistreerd voor een (GPK).',
};

const otherNotification: MyNotification = {
  id: 'other',
  themaID: 'PARKEREN',
  themaTitle: 'Parkeren',
  datePublished: '2026-01-01',
  title: 'Andere melding',
  description: 'Een andere update.',
};

describe('useAppStateNotifications', () => {
  beforeEach(() => {
    act(() => {
      useAppStateStore.setState({
        isReady: true,
        NOTIFICATIONS: apiSuccessResult([gpkNotification, otherNotification]),
      });
      useAuthMethodTypeStore.setState({ authMethod: 'digid' });
    });
  });

  afterEach(() => {
    act(() => {
      useAppStateStore.setState({
        isReady: false,
        NOTIFICATIONS: {
          content: [],
          status: 'PRISTINE',
          isActive: true,
          profileTypes: [],
        },
      });
      useAuthMethodTypeStore.setState({ authMethod: 'digid' });
    });
  });

  it('only shows GPK notifications for DigiD Gemachtigd', () => {
    act(() => {
      useAuthMethodTypeStore.setState({ authMethod: 'digidGemachtigd' });
    });

    const { result } = renderHook(() => useAppStateNotifications());

    expect(result.current.notifications.map(({ id }) => id)).toEqual(['gpk']);
  });

  it('does not filter notifications for other auth methods', () => {
    useAuthMethodTypeStore.setState({ authMethod: 'digid' });

    const { result } = renderHook(() => useAppStateNotifications());

    expect(result.current.notifications.map(({ id }) => id)).toEqual([
      'gpk',
      'other',
      'welcome01',
    ]);
  });
});
