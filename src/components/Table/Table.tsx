import React, { ReactNode } from 'react';
import styles from './Table.module.scss';
import { entries } from 'helpers/App';
import Linkd from 'components/Button/Button';
import { Unshaped } from 'App.types';
import classnames from 'classnames';
import { capitalizeFirstLetter } from '../../helpers/App';

export function addTitleLinkComponent(
  items: Unshaped[],
  titleKey: string = 'title'
) {
  return items.map((item: any) => {
    return {
      ...item,
      [titleKey]: (
        <Linkd href={item.link.to}>
          {capitalizeFirstLetter(item[titleKey]) || 'uhhhh'}
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
  const hasDisplayPropTableHeadingLabels = !!Object.keys(displayPropsFinal)
    .length;

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
                {item[key] || <span>&mdash;</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
