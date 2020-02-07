import { BrpApiState, useBrpApi } from 'hooks/api/api.brp';
import useMyTipsApi from 'hooks/api/my-tips-api.hook';
import useMyNotificationsApi from 'hooks/api/my-notifications-api.hook';
import useSessionApi, { SessionApiState } from 'hooks/api/session.api.hook';
import React, { createContext, useEffect } from 'react';

import { ComponentChildren } from './App.types';
import useErfpachtApi, { ErfpachtApiState } from './hooks/api/api.erfpacht';
import useFocusApi, {
  FocusApiState,
  useFocusInkomenSpecificatiesApi,
  FocusInkomenSpecificatiesApiState,
} from './hooks/api/api.focus';
import useWmoApi, { WmoApiState } from './hooks/api/api.wmo';
import { MyTipsApiState } from './hooks/api/my-tips-api.hook';
import { MyNotificationsApiState } from './hooks/api/my-notifications-api.hook';
import { MyChaptersApiState } from './helpers/myChapters';
import useMyArea, { MyAreaApiState } from './hooks/api/api.myarea';
import { getFullAddress, isMokum } from 'data-formatting/brp';
import { getApiConfigValue } from 'helpers/App';
import { GarbageApiState } from './hooks/api/api.garbage';
import useBelastingApi, { BelastingApiState } from './hooks/api/api.belasting';
import useGarbageApi from './hooks/api/api.garbage';
import getMyChapters from './helpers/myChapters';

type MyCasesApiState = FocusApiState;

export interface AppState {
  BRP: BrpApiState;
  SESSION: SessionApiState;
  MELDINGEN: MyNotificationsApiState;
  MY_CASES: MyCasesApiState;
  MIJN_TIPS: MyTipsApiState;
  WMO: WmoApiState;
  FOCUS: FocusApiState;
  FOCUS_INKOMEN_SPECIFICATIES: FocusInkomenSpecificatiesApiState;
  MY_CHAPTERS: MyChaptersApiState;
  ERFPACHT: ErfpachtApiState;
  GARBAGE: GarbageApiState;
  MIJN_BUURT: MyAreaApiState;
  BELASTINGEN: BelastingApiState;
}

export type StateKey = keyof AppState;

// Use typecasting here to allow for proper state completion and use in deconstruction assignments.
export const AppContext = createContext<AppState>({} as AppState);
export const SessionContext = createContext<SessionApiState>(
  {} as SessionApiState
);

interface SessionStateProps {
  children: ComponentChildren;
  value?: SessionApiState;
}

export function SessionState({ children, value }: SessionStateProps) {
  let session: SessionApiState = useSessionApi();
  if (value) {
    session = value;
  }
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

export function useAppState(value?: any): Omit<AppState, 'SESSION'> {
  const WMO = useWmoApi();
  const FOCUS = useFocusApi();
  const FOCUS_INKOMEN_SPECIFICATIES = useFocusInkomenSpecificatiesApi();

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
  const BELASTINGEN = useBelastingApi();
  const MIJN_TIPS = useMyTipsApi();
  const ERFPACHT = useErfpachtApi();
  const MIJN_BUURT = useMyArea();
  const GARBAGE = useGarbageApi();
  const MY_CHAPTERS = getMyChapters({
    WMO,
    FOCUS,
    ERFPACHT,
    GARBAGE,
    BRP,
    MIJN_BUURT,
    BELASTINGEN,
  } as AppState);

  const MELDINGEN = useMyNotificationsApi({
    FOCUS,
    BRP,
    BELASTINGEN,
  } as AppState);

  const tipsDependencies = [
    getApiConfigValue('WMO', 'postponeFetch', false) || WMO.isDirty,
    getApiConfigValue('FOCUS', 'postponeFetch', false) || FOCUS.isDirty,
    ERFPACHT.isDirty,
    BRP.isDirty,
    getApiConfigValue('BELASTINGEN', 'postponeFetch', true) ||
      BELASTINGEN.isDirty,
  ];

  const address = BRP?.data?.adres ? getFullAddress(BRP.data.adres) : '';
  const mokum = isMokum(BRP);
  const refetchMyArea = MIJN_BUURT.refetch;
  const refetchGarbage = GARBAGE.refetch;
  const centroid = MIJN_BUURT.data?.centroid;

  // Fetch lat/lon for addresss
  useEffect(() => {
    if (mokum && address) {
      refetchMyArea(address);
    }
  }, [address, mokum, refetchMyArea]);

  // Fetch garbage information for address at lat,lon
  useEffect(() => {
    if (centroid && mokum) {
      refetchGarbage({ centroid });
    }
  }, [mokum, centroid, refetchGarbage]);

  // Fetch tips when dependent sources are loaded
  // TODO: Exclude api responses that returned error
  useEffect(() => {
    if (tipsDependencies.every(isReady => isReady)) {
      MIJN_TIPS.refetch({
        WMO: WMO.rawData,
        FOCUS: FOCUS.rawData,
        ERFPACHT: ERFPACHT.data.status,
        BRP: BRP.data,
        BELASTINGEN: BELASTINGEN.data,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...tipsDependencies, MIJN_TIPS.isOptIn]);

  // NOTE: For now we can use this solution but we probably need some more finegrained memoization of the state as the app grows larger.
  return {
    BRP,
    // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component
    // by calling the refetch method implemented in the api hooks.
    MELDINGEN,
    MY_CASES,
    MIJN_TIPS,
    WMO,
    FOCUS,
    FOCUS_INKOMEN_SPECIFICATIES,
    MY_CHAPTERS,
    ERFPACHT,
    MIJN_BUURT,
    GARBAGE,
    BELASTINGEN,
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
