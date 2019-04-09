import React, { createContext } from 'react';
import { useBrpApi, BrpState } from 'hooks/api/brp-api.hook';
import useSessionApi, { SessionState } from 'hooks/api/session.api.hook';
import useMyUpdatesApi from 'hooks/api/my-updates-api.hook';
import useMyCasesApi from 'hooks/api/my-cases-api.hook';
import useMyTipsApi from 'hooks/api/my-tips-api.hook';

// E.g Used for testing componnets that consume parts of the app state.
export interface CustomAppState {
  [key: string]: any;
}

export interface DefaultAppState {
  BRP: BrpState,
  SESSION: SessionState,
  MY_UPDATES: object,
  MY_CASES: object,
  MY_TIPS: object,
}

export type AppState = DefaultAppState | CustomAppState;

export const AppContext = createContext<AppState>({});

export default ({ children, value }: { children: JSX.Element[], value?: CustomAppState }) => {
  const defaultAppState = value || {
    BRP: useBrpApi(),
    SESSION: useSessionApi(),

    // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component.
    MY_UPDATES: useMyUpdatesApi(),
    MY_CASES: useMyCasesApi(),
    MY_TIPS: useMyTipsApi(),
  };

  return <AppContext.Provider value={defaultAppState}>{children}</AppContext.Provider>;
}
