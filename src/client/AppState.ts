import { createContext } from 'react';
import {
  PRISTINE_APPSTATE,
  AppState as AppStateMain,
} from './hooks/useAppState';

export type AppState = AppStateMain;

export const AppContext = createContext<AppState>(PRISTINE_APPSTATE);
