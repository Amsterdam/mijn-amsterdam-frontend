import { BrpApiState, useBrpApi } from 'hooks/api/brp-api.hook';
import useMyTipsApi from 'hooks/api/my-tips-api.hook';
import useMyNotificationsApi from 'hooks/api/my-notifications-api.hook';
import useSessionApi, { SessionApiState } from 'hooks/api/session.api.hook';
import useMyChapters from 'hooks/api/myChapters.hook';
import React, { createContext, useMemo, useEffect, useState } from 'react';

import { ComponentChildren } from './App.types';
import useErfpachtApi, { ErfpachtApiState } from './hooks/api/api.erfpacht';
import useFocusApi, { FocusApiState } from './hooks/api/api.focus';
import useWmoApi, { WmoApiState } from './hooks/api/api.wmo';
import { MyTipsApiState } from './hooks/api/my-tips-api.hook';
import { MyNotificationsApiState } from './hooks/api/my-notifications-api.hook';
import { MyChaptersApiState } from './hooks/api/myChapters.hook';
import useMyMap from './hooks/api/api.mymap';
import { getFullAddress } from 'data-formatting/brp';
import { ApiConfig, ApiUrls } from './App.constants';

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

export interface TutorialState {
  isTutorialVisible: boolean;
  setIsTutorialVisible: Function;
}
interface TutorialStateProps {
  children: ComponentChildren;
}

export const TutorialContext = createContext<TutorialState>(
  {} as TutorialState
);

export function TutorialState({ children }: TutorialStateProps) {
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  return (
    <TutorialContext.Provider
      value={{ isTutorialVisible, setIsTutorialVisible }}
    >
      {children}
    </TutorialContext.Provider>
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
  const MY_NOTIFICATIONS = useMyNotificationsApi({ FOCUS });
  const MY_TIPS = useMyTipsApi();
  const ERFPACHT = useErfpachtApi();
  const MY_CHAPTERS = useMyChapters({ WMO, FOCUS, ERFPACHT });
  const MY_AREA = useMyMap();
  const tipsDependencies = [
    ApiConfig[ApiUrls.WMO].postponeFetch || WMO.isDirty,
    ApiConfig[ApiUrls.FOCUS].postponeFetch || FOCUS.isDirty,
    ERFPACHT.isDirty,
    BRP.isDirty,
  ];

  useEffect(() => {
    if (BRP.data.adres && BRP.data.adres.straatnaam) {
      MY_AREA.refetch(getFullAddress(BRP.data.adres));
    }
  }, [BRP.data.adres && BRP.data.adres.straatnaam]);

  useEffect(() => {
    if (tipsDependencies.every(isReady => isReady)) {
      MY_TIPS.refetch({
        WMO: WMO.rawData,
        FOCUS: FOCUS.rawData,
        ERFPACHT: false,
        BRP: BRP.data,
      });
    }
  }, tipsDependencies);

  // NOTE: For now we can use this solution but we probably need some more finegrained memoization of the state as the app grows larger.
  return useMemo(() => {
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
    };
  }, [
    WMO.isLoading,
    FOCUS.isLoading,
    BRP.isLoading,
    MY_NOTIFICATIONS.isLoading,
    MY_CASES.isLoading,
    MY_TIPS.isLoading,
    ERFPACHT.isLoading,
    MY_CHAPTERS.isLoading,
    MY_AREA.url,
  ]);
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
