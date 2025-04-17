import { ProfileSectionData, Value } from './ProfileSectionPanel';
import { SomeOtherString } from '../../../../universal/helpers/types';
import { entries, isRecord } from '../../../../universal/helpers/utils';

type ValueFormatter<V, T, S> = (
  value: V,
  item: T,
  stateSliceContent?: S
) => Value;

type LabelFormatter<T, S> = (item: T, stateSliceContent?: S) => string;

export type ProfileValueFormatter<V, T, S> =
  | string
  | [string | LabelFormatter<T, S>, ValueFormatter<V, T, S>];

export type ProfileLabels<T, S> = {
  [key in keyof T]: ProfileValueFormatter<T[key], T, S>;
} & { [key: SomeOtherString]: ProfileValueFormatter<never, T, S> };

export function formatProfileSectionData<T, X>(
  labelConfig: X,
  data: unknown,
  profileData: T
): ProfileSectionData {
  const formattedData = entries(labelConfig).reduce(
    (acc, [key, labelValueFormater]) => {
      let value = null;

      const [labelOrLabelFormatter, formatValue] = Array.isArray(
        labelValueFormater
      )
        ? labelValueFormater
        : [labelValueFormater, null];

      const label =
        typeof labelOrLabelFormatter === 'function'
          ? labelOrLabelFormatter(data, profileData)
          : labelOrLabelFormatter;

      if (data && isRecord(data) && !Array.isArray(data)) {
        const dataValue = data[key];
        value = formatValue
          ? formatValue(dataValue, data, profileData)
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
    },
    {}
  );

  return formattedData;
}
