import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';

import { useTrackThemas } from './useTrackThemas.hook';
import { AppState } from '../../universal/types/App.types';
import { trackEvent } from '../helpers/monitoring';
import MockApp from '../pages/MockApp';

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

    const mockApp = ({ children }: { children: ReactNode }) => (
      <MockApp
        state={testState}
        routePath="/"
        routeEntry="/"
        component={() => <>{children}</>}
      />
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
