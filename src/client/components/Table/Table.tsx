import classnames from 'classnames';
import React, { ReactNode } from 'react';
import { capitalizeFirstLetter, entries } from '../../../universal/helpers';
import { Unshaped } from '../../../universal/types';
import Linkd from '../Button/Button';
import styles from './Table.module.scss';
import InnerHtml from '../InnerHtml/InnerHtml';

export function addTitleLinkComponent(
  items: any[],
  titleKey: string = 'title'
) {
  return items.map((item) => {
    if (!item.link?.to) {
      return item;
    }
    return {
      ...item,
      [titleKey]: (
        <Linkd href={item.link.to}>
          {capitalizeFirstLetter(item[titleKey]) || 'Onbekend item'}
        </Linkd>
      ),
    };
  });
}

export interface TableProps {
  items: Unshaped[];
  className?: string;
  titleKey?: string;
  displayProps?: { [key: string]: string | number | ReactNode };
}

interface TdValueProps {
  value: string | number | ReactNode;
}

function TdValue({ value }: TdValueProps) {
  if (value !== '' && value !== 0 && !value) {
    return <span>&nbsp;</span>;
  }
  if (React.isValidElement(value)) {
    return value;
  }
  return <InnerHtml el="span">{value as string}</InnerHtml>;
}

export default function Table({
  items,
  displayProps,
  titleKey = 'title',
  className,
}: TableProps) {
  const displayPropsFinal = !displayProps ? { [titleKey]: ' ' } : displayProps;
  const displayPropEntries = entries(displayPropsFinal).filter(
    ([key]) => key !== titleKey
  );
  const hasDisplayPropTableHeadingLabels = !!Object.keys(
    displayPropsFinal
  ).filter((titleKey) => !!displayPropsFinal[titleKey]).length;

  return (
    <table className={classnames(styles.Table, className)}>
      {hasDisplayPropTableHeadingLabels && (
        <thead>
          <tr className={styles.TableRow}>
            {!!items[0] && titleKey in items[0] && (
              <th className={styles.DisplayProp}>
                {displayPropsFinal[titleKey] || ' '}
              </th>
            )}
            {displayPropEntries.map(([key, label]) => (
              <th key={`th-${key}`} className={styles.DisplayProp}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {items.map((item: Unshaped, index) => (
          <tr
            key={item.id || `${titleKey}-${index}`}
            className={styles.TableRow}
          >
            {titleKey in item && (
              <td className={styles.DisplayPropTitle}>{item[titleKey]}</td>
            )}
            {displayPropEntries.map(([key, label]) => (
              <td key={`td-${key}`} className={styles.DisplayProp}>
                {!!label && (
                  <span className={styles.DisplayPropLabel}>{label}:</span>
                )}
                <TdValue value={item[key]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
