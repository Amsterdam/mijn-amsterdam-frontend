import { ProfileSectionData, Value } from './ProfileSectionPanel';
import { entries, isRecord } from '../../../universal/helpers/utils';

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
  data: unknown,
  profileData: T
): ProfileSectionData {
  const formattedData = entries(labelConfig).reduce((acc, [key, formatter]) => {
    const labelFormatter = Array.isArray(formatter) ? formatter[0] : formatter;

    const label =
      typeof labelFormatter === 'function'
        ? labelFormatter(key, data, profileData)
        : labelFormatter;
    let value = null;
    if (data && isRecord(data)) {
      const dataValue = data[key];
      value = Array.isArray(formatter)
        ? formatter[1](dataValue, data, profileData)
        : dataValue;
    }

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
