import {
  featureToggle,
  linkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './Contact-thema-config.ts';

export function useContactThema() {
  return {
    id: themaId,
    featureToggle,
    title: themaTitle,
    linkListItems,
    routeConfig,
    isError: false,
    isLoading: false,
  };
}
