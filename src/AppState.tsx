import { BrpApiState, useBrpApi } from 'hooks/api/api.brp';
import useMyTipsApi from 'hooks/api/my-tips-api.hook';
import useMyNotificationsApi from 'hooks/api/my-notifications-api.hook';
import useSessionApi, { SessionApiState } from 'hooks/api/session.api.hook';
import React, { createContext, useEffect } from 'react';

import { ComponentChildren } from './App.types';
import useErfpachtApi, { ErfpachtApiState } from './hooks/api/api.erfpacht';
import useFocusApi, { FocusApiState } from './hooks/api/api.focus';
import useWmoApi, { WmoApiState } from './hooks/api/api.wmo';
import { MyTipsApiState } from './hooks/api/my-tips-api.hook';
import { MyNotificationsApiState } from './hooks/api/my-notifications-api.hook';
import { MyChaptersApiState } from './helpers/myChapters';
import useMyMap from './hooks/api/api.mymap';
import { getFullAddress, isMokum } from 'data-formatting/brp';
import { getApiConfigValue } from 'helpers/App';
import { GarbageApiState } from './hooks/api/api.garbage';
import useGarbageApi from './hooks/api/api.garbage';
import getMyChapters from './helpers/myChapters';

type MyCasesApiState = FocusApiState;

export interface AppState {
  BRP: BrpApiState;
  SESSION: SessionApiState;
  MY_NOTIFICATIONS: MyNotificationsApiState;
  MY_CASES: MyCasesApiState;
  MY_TIPS: MyTipsApiState;
  WMO: WmoApiState;
  FOCUS: FocusApiState;
  MY_CHAPTERS: MyChaptersApiState;
  ERFPACHT: ErfpachtApiState;
  GARBAGE: GarbageApiState;
  MY_AREA: any;
}

export type StateKey = keyof AppState;

// Use typecasting here to allow for proper state completion and use in deconstruction assignments.
export const AppContext = createContext<AppState>({} as AppState);
export const SessionContext = createContext<SessionApiState>(
  {} as SessionApiState
);

interface SessionStateProps {
  children: ComponentChildren;
}

export function SessionState({ children }: SessionStateProps) {
  const session = useSessionApi();
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

interface AppStateProps {
  children?: ComponentChildren;
  value?: Partial<AppState>;
}

export function useAppState(value?: any) {
  const WMO = useWmoApi();
  const FOCUS = useFocusApi();

  const { data: focusData, ...rest } = FOCUS;
  // At the time of writing we only show recentCases from the Focus API.
  const MY_CASES = {
    data: {
      ...focusData,
      items: focusData.recentCases,
      total: focusData.recentCases.length,
    },
    ...rest,
  };

  const BRP = useBrpApi();
  const MY_TIPS = useMyTipsApi();
  const ERFPACHT = useErfpachtApi();
  const MY_AREA = useMyMap();
  const GARBAGE = useGarbageApi({ centroid: MY_AREA.centroid });
  const MY_CHAPTERS = getMyChapters({
    WMO,
    FOCUS,
    ERFPACHT,
    GARBAGE,
    BRP,
    MY_AREA,
  });
  const MY_NOTIFICATIONS = useMyNotificationsApi({ FOCUS, BRP });

  const tipsDependencies = [
    getApiConfigValue('WMO', 'postponeFetch', false) || WMO.isDirty,
    getApiConfigValue('FOCUS', 'postponeFetch', false) || FOCUS.isDirty,
    ERFPACHT.isDirty,
    BRP.isDirty,
  ];

  const address = BRP?.data?.adres ? getFullAddress(BRP.data.adres[0]) : '';
  const mokum = isMokum(BRP);
  const refetchMyArea = MY_AREA.refetch;
  const refetchGarbage = GARBAGE.refetch;
  const centroid = MY_AREA.centroid;

  // Fetch lat/lon for addresss
  useEffect(() => {
    if (mokum && address) {
      refetchMyArea(address);
    }
  }, [address, mokum, refetchMyArea]);

  // Fetch garbage information for address at lat,lon
  useEffect(() => {
    if (centroid !== null && mokum) {
      refetchGarbage({ centroid });
    }
  }, [mokum, centroid, refetchGarbage]);

  // Fetch tips when dependent sources are loaded
  // TODO: Exclude api responses that returned error
  useEffect(() => {
    if (tipsDependencies.every(isReady => isReady)) {
      MY_TIPS.refetch({
        WMO: WMO.rawData,
        FOCUS: FOCUS.rawData,
        ERFPACHT: ERFPACHT.data.status,
        BRP: BRP.data,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...tipsDependencies, MY_TIPS.isOptIn]);

  // NOTE: For now we can use this solution but we probably need some more finegrained memoization of the state as the app grows larger.
  return {
    BRP,
    // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component
    // by calling the refetch method implemented in the api hooks.
    MY_NOTIFICATIONS,
    MY_CASES,
    MY_TIPS,
    WMO,
    FOCUS,
    MY_CHAPTERS,
    ERFPACHT,
    MY_AREA,
    GARBAGE,
  };
}

export default ({ children, value }: AppStateProps) => {
  const appState = value || useAppState();
  return (
    // TODO: Straight out partial appState assignments. Forcing type assignment here for !!!111!!1!!
    <AppContext.Provider value={appState as AppState}>
      {children}
    </AppContext.Provider>
  );
};
