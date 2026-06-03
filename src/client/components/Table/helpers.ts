import type {
  DisplayProps,
  DisplayPropsBase,
  ScreenSize,
  TableV2ColWidths,
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
  return 'config' in displayProps ? displayProps.config : undefined;
}

export function getColWidth(
  config: TableV2ColWidths,
  size: ScreenSize,
  index: number
) {
  return config[size]?.filter((value) =>
    typeof value === 'boolean' ? value : parseInt(value, 10) !== 0
  )[index];
}
