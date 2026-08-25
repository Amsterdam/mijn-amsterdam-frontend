import {
  getDisplayPropsColWidths,
  getDisplayProps,
  getVisibleColumnConfigValue,
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
  const visibleEntries = Array.isArray(propsDisplayConfig)
    ? displayPropEntries.filter((_entry, index) => {
        const columnConfig = propsDisplayConfig[index];

        if (typeof columnConfig === 'boolean') {
          return columnConfig;
        }

        return parseInt(columnConfig, 10) !== 0;
      })
    : displayPropEntries;

  const mappedVisibleEntries = visibleEntries.map(([key, value], index) => {
    const width = config
      ? getVisibleColumnConfigValue(
          config,
          isSmallScreen ? 'small' : 'large',
          index
        )
      : undefined;
    return [
      key,
      { label: value, width: typeof width === 'string' ? width : undefined },
    ] as const;
  });
  return mappedVisibleEntries;
}
