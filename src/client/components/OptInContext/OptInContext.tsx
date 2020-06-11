import React, { createContext } from 'react';
import { OptIn, useOptIn } from '../../hooks/optin.hook';
import { ComponentChildren } from '../../../universal/types';

export const OptInContext = createContext<OptIn>({
  isOptIn: false,
  optIn: () => void 0,
  optOut: () => void 0,
});

interface SessionStateProps {
  children: ComponentChildren;
}

export function OptInContextProvider({ children }: SessionStateProps) {
  const optInState = useOptIn();

  return (
    <OptInContext.Provider value={optInState}>{children}</OptInContext.Provider>
  );
}
