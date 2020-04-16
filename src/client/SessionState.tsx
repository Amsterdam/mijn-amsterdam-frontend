import React, { createContext } from 'react';
import { ComponentChildren } from '../universal/types/App.types';
import useSessionApi from './hooks/api/api.session';

type SessionApiState = ReturnType<typeof useSessionApi>;

export const SessionContext = createContext<SessionApiState>(
  {} as ReturnType<typeof useSessionApi>
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
