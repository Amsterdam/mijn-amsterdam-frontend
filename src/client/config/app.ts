// NOTE: Keep up-to-date with _breakpoints.scss
export const Breakpoints = {
  tablet: 1024,
  phone: 640,
  minWidthMediumScreen: 576,
  minWidthWideScreen: 1088,
};

export const PLACEHOLDER_IMAGE_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

// Legacy export, these used to live in this file
export { ExternalUrls, Colors } from '../../universal/config/app';

interface UiElementConfig {
  MainNavBarSimple: boolean;
}

type UiElementConfigByProfileType = Record<ProfileType, UiElementConfig | null>;

const uiElementConfigByProfileType: UiElementConfigByProfileType = {
  'private-attributes': {
    MainNavBarSimple: true,
  },
  private: {
    MainNavBarSimple: false,
  },
  commercial: {
    MainNavBarSimple: false,
  },
};

export function isUiElementVisible(
  profileType: ProfileType,
  uiElementName: keyof UiElementConfig
): boolean {
  const elementConfigByProfileType =
    uiElementConfigByProfileType?.[profileType];

  if (elementConfigByProfileType) {
    return elementConfigByProfileType?.[uiElementName] ?? false;
  }

  return true;
}

export function isUiElementHidden(
  profileType: ProfileType,
  uiElementName: keyof UiElementConfig
): boolean {
  return !isUiElementVisible(profileType, uiElementName);
}

export const MAX_TABLE_ROWS_ON_THEMA_PAGINA = 3;
