import { ProfileSectionData, Value } from './ProfileSectionPanel';
import { SomeOtherString } from '../../../universal/helpers/types';
import { entries, isRecord } from '../../../universal/helpers/utils';

type LabelValueFormatter<V, T, S> = (
  value: V,
  item: T,
  stateSliceContent?: S
) => Value;

type LabelFormatter<T, S> = (item: T, stateSliceContent?: S) => string;

export type ProfileLabelValueFormatter<V, T, S> =
  | string
  | [string | LabelFormatter<T, S>, LabelValueFormatter<V, T, S>];

export type ProfileLabels<T, S> = {
  [key in keyof T]: ProfileLabelValueFormatter<T[key], T, S>;
} & { [key: SomeOtherString]: ProfileLabelValueFormatter<never, T, S> };

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
