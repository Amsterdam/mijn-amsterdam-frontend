import type {
  DisplayProps,
  DisplayPropsBase,
  ScreenSize,
  TableV2ColWidths,
  DisplayPropsViewConfig,
} from './TableV2.types.ts';

export function getDisplayProps<T extends DisplayProps<object>>(
  displayProps: T
): DisplayPropsBase<T> {
  return 'props' in displayProps
    ? displayProps.props
    : (displayProps as DisplayPropsBase<T>);
}

export function getDisplayPropsColWidths<T extends DisplayProps<object>>(
  displayProps: T
): TableV2ColWidths | undefined {
  return 'colWidths' in displayProps ? displayProps.colWidths : undefined;
}

export function getColWidth(
  config: DisplayPropsViewConfig,
  size: ScreenSize,
  index: number
) {
  const widthsForSize = config[size];
  if (!widthsForSize) {
    return undefined;
  }

  const visibleWidths = widthsForSize.filter((value) => {
    if (typeof value === 'boolean') {
      return value;
    }

    return parseInt(value, 10) !== 0;
  });

  return visibleWidths[index];
}
