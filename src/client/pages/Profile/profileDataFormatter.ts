import { ProfileSectionData, Value } from './ProfileSectionPanel';
import { entries } from '../../../universal/helpers/utils';

export type ProfileLabelValueFormatter<T, V, S> =
  | string
  | [
      string | ((key: string, item: T, stateSliceContent?: S) => string),
      (value: V, item: T, stateSliceContent?: S) => Value,
    ];

export type ProfileLabels<T, S> = {
  [key in keyof T]: ProfileLabelValueFormatter<T, T[key], S>;
};

export function formatProfileSectionData<T, X>(
  labelConfig: X,
  data: any, // TODO: Fix any
  profileData: T
): ProfileSectionData {
  const formattedData = entries(labelConfig).reduce((acc, [key, formatter]) => {
    const labelFormatter = Array.isArray(formatter) ? formatter[0] : formatter;

    const label =
      typeof labelFormatter === 'function'
        ? labelFormatter(key, data, profileData)
        : labelFormatter;
    const value = Array.isArray(formatter)
      ? formatter[1](data[key], data, profileData)
      : data[key];

    // Don't display falsey values
    if (!value) {
      return acc;
    }

    return {
      ...acc,
      [label]: value,
    };
  }, {});

  return formattedData;
}
