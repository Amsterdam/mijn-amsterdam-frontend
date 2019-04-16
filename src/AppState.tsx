import React, { createContext } from 'react';
import { useBrpApi, BrpApiState } from 'hooks/api/brp-api.hook';
import useSessionApi, { SessionApiState } from 'hooks/api/session.api.hook';
import useMyUpdatesApi from 'hooks/api/my-updates-api.hook';
import useMyCasesApi from 'hooks/api/my-cases-api.hook';
import useMyTipsApi from 'hooks/api/my-tips-api.hook';
import { ChildrenContent } from './App.types';
import { MyUpdatesApiState } from './hooks/api/my-updates-api.hook';
import { MyCasesApiState } from './hooks/api/my-cases-api.hook';
import { MyTipsApiState } from './hooks/api/my-tips-api.hook';

export interface AppState {
  BRP: BrpApiState;
  SESSION: SessionApiState;
  MY_UPDATES: MyUpdatesApiState;
  MY_CASES: MyCasesApiState;
  MY_TIPS: MyTipsApiState;
}

export const AppContext = createContext<AppState>({} as AppState);
export const SessionContext = createContext<SessionApiState>(
  {} as SessionApiState
);

interface SessionStateProps {
  render: (session: SessionApiState) => ChildrenContent;
}

export function SessionState({ render }: SessionStateProps) {
  const session = useSessionApi();
  return (
    <SessionContext.Provider value={session}>
      {render(session)}
    </SessionContext.Provider>
  );
}

interface AppStateProps {
  children?: ChildrenContent;
  value?: Partial<AppState>;
  session?: SessionApiState;
  render?: (state: AppState) => ChildrenContent;
}

export default ({ render, children, value, session }: AppStateProps) => {
  let appState;

  if (typeof value !== 'undefined') {
    appState = value;
  } else {
    appState = {
      BRP: useBrpApi(),
      SESSION: session,

      // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component.
      MY_UPDATES: useMyUpdatesApi(),
      MY_CASES: useMyCasesApi(),
      MY_TIPS: useMyTipsApi(),
    };
  }

  return (
    // TODO: Straight out partial appState assignments. Forcing type assignment here for !!!111!!1!!
    <AppContext.Provider value={appState as AppState}>
      {render ? render(appState as AppState) : children}
    </AppContext.Provider>
  );
};
