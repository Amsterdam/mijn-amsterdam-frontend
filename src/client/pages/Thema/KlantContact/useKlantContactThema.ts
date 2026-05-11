import {
  featureToggle,
  linkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './KlantContact-thema-config.ts';

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
