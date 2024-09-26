import { renderHook } from '@testing-library/react';
import { trackEvent } from '../utils/monitoring';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { ReactNode } from 'react';
import { appStateAtom } from './useAppState';
import { AppState } from '../../universal/types';
import { useTrackThemas } from './useTrackThemas.hook';

vi.mock('../utils/monitoring', () => ({
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
      PARKEREN: {
        status: 'OK',
        content: {
          url: 'http://localhost:3000/afspraak-maken',
        },
      },
    } as AppState;

    function initializeState(snapshot: MutableSnapshot) {
      snapshot.set(appStateAtom, testState);
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
