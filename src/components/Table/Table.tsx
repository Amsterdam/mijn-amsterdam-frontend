import React from 'react';
import styles from './Table.module.scss';
import { entries } from 'helpers/App';
import Linkd from 'components/Button/Button';

export function addTitleLinkComponent(
  items: any[],
  titleKey: string = 'title'
) {
  return items.map((item: any) => {
    return {
      ...item,
      [titleKey]: <Linkd href={item.link.to}>{item[titleKey]}</Linkd>,
    };
  });
}

export interface TableProps {
  items: any[];
  className?: string;
  titleKey?: string;
  displayProps?: { [key: string]: string }; // key => Label. Will be displayed right of the title in the table
}

export default function Table({
  items,
  displayProps,
  titleKey = 'title',
}: TableProps) {
  const displayPropEntries = displayProps
    ? entries(displayProps).slice(titleKey in displayProps ? 1 : 0) // Don't use the $titleKey here, title is always fixed as first prop in the table;
    : [];
  const hasDisplayPropTableHeadingLabels = displayPropEntries.some(
    ([, label]) => !!label
  );
  return (
    <table className={styles.Table}>
      {hasDisplayPropTableHeadingLabels && (
        <thead>
          <tr className={styles.TableRow}>
            <th className={styles.DisplayProp}>
              {(displayProps && displayProps[titleKey]) || ' '}
            </th>
            {displayPropEntries.map(([, label]) => (
              <th key={label} className={styles.DisplayProp}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {items.map((item: any) => (
          <tr key={item.id} className={styles.TableRow}>
            {!!item[titleKey] && (
              <td className={styles.DisplayPropTitle}>{item[titleKey]}</td>
            )}
            {displayPropEntries.map(([key, label]) => (
              <td key={key} className={styles.DisplayProp}>
                <span className={styles.DisplayPropLabel}>{label}:</span>
                {item[key] || <span>&mdash;</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
