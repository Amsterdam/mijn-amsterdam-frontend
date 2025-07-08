import {
  DisplayProps,
  type DisplayPropsBase,
  type TableV2ColWidths,
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
