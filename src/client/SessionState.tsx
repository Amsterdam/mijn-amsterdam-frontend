import React, { createContext } from 'react';
import { ComponentChildren } from '../universal/types/App.types';
import useSessionApi, { SessionApiState } from './hooks/api/session.api.hook';

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
