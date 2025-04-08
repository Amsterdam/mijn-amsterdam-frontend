import { DisplayProps } from './TableV2.types';
import { omit } from '../../../universal/helpers/utils';

export function withOmitDisplayPropsForSmallScreens<
  T extends DisplayProps<object>,
>(displayProps: T, omitKeysForSmallScreens: Array<keyof T>) {
  return {
    ...displayProps,
    smallscreen: omit(displayProps, omitKeysForSmallScreens),
  };
}

export function getDisplayPropsForScreenSize<T extends DisplayProps<object>>(
  displayProps: T,
  isSmallScreen: boolean
) {
  return 'smallscreen' in displayProps && isSmallScreen
    ? displayProps.smallscreen
    : omit(displayProps, ['smallscreen']);
}
