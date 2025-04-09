import { DisplayProps } from './TableV2';
import { omit } from '../../../universal/helpers/utils';

export function withOmitDisplayPropsForSmallScreens<T extends object>(
  displayProps: DisplayProps<T>,
  omitKeysForSmallScreens: Array<keyof T>
) {
  return {
    ...displayProps,
    smallscreen: omit(displayProps, omitKeysForSmallScreens),
  };
}

export function getDisplayPropsForScreenSize<T extends object>(
  displayProps: DisplayProps<T>,
  isSmallScreen: boolean
) {
  return 'smallscreen' in displayProps && isSmallScreen
    ? displayProps.smallscreen
    : omit(displayProps, ['smallscreen']);
}
