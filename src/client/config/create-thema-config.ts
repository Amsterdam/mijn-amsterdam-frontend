import type { ThemaConfigBase } from './thema-types.ts';

export function createThemaConfig<T extends ThemaConfigBase>(
  themaConfig: T,
  profileType: ProfileType
): T {
  return {
    ...themaConfig,
    pageLinks: themaConfig.pageLinks.filter((pageLink) => {
      return pageLink.profileTypes?.includes(profileType) ?? true;
    }),
  };
}
