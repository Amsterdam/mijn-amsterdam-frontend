import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { appStateAtom, appStateReadyAtom } from './useAppState';
import { useTrackThemas } from './useTrackThemas.hook';
import { AppState } from '../../universal/types/App.types';
import { trackEvent } from '../helpers/monitoring';

vi.mock('../helpers/monitoring', () => ({
  trackEvent: vi.fn(),
}));

describe('useTrackThemas', () => {
  test('trackEvent is called with the correct arguments', () => {
    const testState = {
      AFIS: {
        status: 'OK',
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: 'yyy-456-yyy',
        },
      },
      VERGUNNINGEN: {
        isActive: true,
      },
      PARKEREN: {
        status: 'OK',
        content: {
          isKnown: true,
          url: 'http://localhost:3000/afspraak-maken',
        },
      },
    } as AppState;

    function initializeState(snapshot: MutableSnapshot) {
      snapshot.set(appStateAtom, testState);
      snapshot.set(appStateReadyAtom, true);
    }

    const mockApp = ({ children }: { children: ReactNode }) => (
      <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
    );

    renderHook(() => useTrackThemas(), {
      wrapper: mockApp,
    });

    expect(trackEvent).toHaveBeenCalledOnce();
    expect(trackEvent).toHaveBeenCalledWith('themas-per-sessie', {
      themas: [
        {
          id: 'AFIS',
          title: 'Facturen en betalen',
        },
        {
          id: 'PARKEREN',
          title: 'Parkeren',
        },
      ],
    });
  });
});
