import { BrpApiState, useBrpApi } from 'hooks/api/brp-api.hook';
import useMyTipsApi from 'hooks/api/my-tips-api.hook';
import useMyUpdatesApi from 'hooks/api/my-updates-api.hook';
import useSessionApi, { SessionApiState } from 'hooks/api/session.api.hook';
import useMyChapters from 'hooks/api/myChapters.hook';
import React, { createContext } from 'react';

import { ComponentChildren } from './App.types';
import useErfpachtApi, { ErfpachtApiState } from './hooks/api/api.erfpacht';
import useFocusApi, { FocusApiState } from './hooks/api/api.focus';
import useWmoApi, { WmoApiState } from './hooks/api/api.wmo';
import { MyTipsApiState } from './hooks/api/my-tips-api.hook';
import { MyUpdatesApiState } from './hooks/api/my-updates-api.hook';
import { MyChaptersApiState } from './hooks/api/myChapters.hook';

type MyCasesApiState = FocusApiState;

export interface AppState {
  BRP: BrpApiState;
  SESSION: SessionApiState;
  MY_UPDATES: MyUpdatesApiState;
  MY_CASES: MyCasesApiState;
  MY_TIPS: MyTipsApiState;
  WMO: WmoApiState;
  FOCUS: FocusApiState;
  MY_CHAPTERS: MyChaptersApiState;
  ERFPACHT: ErfpachtApiState;
}

export type StateKey = keyof AppState;

// Use typecasting here to allow for proper state completion and use in deconstruction assignments.
export const AppContext = createContext<AppState>({} as AppState);
export const SessionContext = createContext<SessionApiState>(
  {} as SessionApiState
);

interface SessionStateProps {
  render: (session: SessionApiState) => ComponentChildren;
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
  children?: ComponentChildren;
  value?: Partial<AppState>;
  session?: SessionApiState;
  render?: (state: AppState) => ComponentChildren;
}

export default ({ render, children, value, session }: AppStateProps) => {
  let appState;

  if (typeof value !== 'undefined') {
    appState = value;
  } else {
    const WMO = useWmoApi();
    const FOCUS = useFocusApi();

    const { data, ...rest } = FOCUS;
    const items = data.items.filter(item => item.inProgress);
    const MY_CASES = {
      data: {
        ...data,
        items,
        total: items.length,
      },
      ...rest,
    };

    const BRP = useBrpApi();
    const MY_UPDATES = useMyUpdatesApi({ FOCUS });
    const MY_TIPS = useMyTipsApi();
    const ERFPACHT = useErfpachtApi();
    const MY_CHAPTERS = useMyChapters({ WMO, FOCUS, ERFPACHT });

    appState = {
      BRP,
      SESSION: session,

      // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component
      // by calling the refetch method implemented in the api hooks.
      MY_UPDATES,
      MY_CASES,
      MY_TIPS,
      WMO,
      FOCUS,
      MY_CHAPTERS,
      ERFPACHT,
    };
  }

  return (
    // TODO: Straight out partial appState assignments. Forcing type assignment here for !!!111!!1!!
    <AppContext.Provider value={appState as AppState}>
      {render ? render(appState as AppState) : children}
    </AppContext.Provider>
  );
};
