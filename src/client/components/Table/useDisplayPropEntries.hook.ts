import {
  getDisplayPropsColWidths,
  getDisplayProps,
  getColWidth,
} from './helpers.ts';
import type { DisplayProps } from './TableV2.types.ts';
import { entries } from '../../../universal/helpers/utils.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';

export function useDisplayPropsEntries<T extends DisplayProps<object>>(
  displayProps: T
) {
  const isSmallScreen = useSmallScreen();
  const config = getDisplayPropsColWidths(displayProps);
  const propsDisplayConfig = config?.[isSmallScreen ? 'small' : 'large'];
  const displayPropEntries = entries(getDisplayProps(displayProps));

  // Filter out display properties that are not defined for the current screen size
  return (
    Array.isArray(propsDisplayConfig)
      ? displayPropEntries.filter((_entry, index) =>
          typeof propsDisplayConfig[index] !== 'boolean'
            ? parseInt(propsDisplayConfig[index], 10) !== 0
            : propsDisplayConfig[index]
        )
      : displayPropEntries
  ).map(([key, value], index) => {
    const width = config
      ? getColWidth(config, isSmallScreen ? 'small' : 'large', index)
      : undefined;
    return [
      key,
      { label: value, width: typeof width === 'string' ? width : undefined },
    ] as const;
  });
}
