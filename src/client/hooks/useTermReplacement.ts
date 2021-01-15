import { useCallback } from 'react';
import { useProfileTypeValue } from './useProfileType';
// Super simple term replace

const GENERAL_COMMERCIAL_TERMS = {
  'Mijn buurt': 'Mijn omgeving',
  Afval: 'Bedrijfsafval',
  'eigen woning': 'bedrijf',
  'Afval rond uw adres': 'Bedrijfsafval rond uw adres',
};

const GENERAL_PRIVATE_TERMS = {
  Openbaresportplek: 'Openbare sportplek',
};

const terms: {
  [profileType in ProfileType]: Record<string, string>;
} = {
  private: GENERAL_PRIVATE_TERMS,
  'private-commercial': GENERAL_COMMERCIAL_TERMS,
  commercial: GENERAL_COMMERCIAL_TERMS,
};

export function termReplace(profileType: ProfileType, term: string) {
  if (terms[profileType] && terms[profileType][term]) {
    return terms[profileType][term];
  }
  return term;
}

export function useTermReplacement() {
  const profileType = useProfileTypeValue();
  return useCallback((term: string) => termReplace(profileType, term), [
    profileType,
  ]);
}
