import { Unshaped } from 'App.types';
import { ReactComponent as CaretIcon } from 'assets/icons/Chevron-Right.svg';
import classnames from 'classnames';
import React, { useState } from 'react';

import { withKeyPress } from 'helpers/App';
import Heading from '../Heading/Heading';
import styles from './DataLinkTable.module.scss';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import { AppRoutes } from 'App.constants';
import { entries } from '../../helpers/App';

export interface DataLinkTableProps {
  items?: Unshaped[];
  title: string;
  startCollapsed?: boolean;
  className?: any;
  displayProps?: { [key: string]: string }; // key => Label. Will be displayed right of the title in the table
  rowHeight?: 'auto' | string;
}

export default function DataLinkTable({
  items = [],
  title = '',
  startCollapsed = true,
  className,
  displayProps,
  rowHeight = 'auto',
}: DataLinkTableProps) {
  const [isCollapsed, setCollapsed] = useState(startCollapsed);
  const classes = classnames(
    styles.DataLinkTable,
    isCollapsed && styles.isCollapsed,
    className
  );

  const toggleCollapsed = withKeyPress<HTMLHeadingElement>(() =>
    setCollapsed(!isCollapsed)
  );

  // Setting an explicit height will result in a nice transition
  const cssCalcExpr = isCollapsed
    ? 0
    : `calc((${items.length} * ${rowHeight}) + 1.5rem)`;

  // Vary the transition duration between 300 and 600ms
  const cssTransitionDurationMS = `${Math.min(
    Math.max(items.length * 60, 300),
    600
  )}ms`;

  return (
    <div className={classes}>
      {!!title && (
        <Heading
          size="mediumLarge"
          role="button"
          className={styles.Title}
          tabIndex={0}
          onKeyPress={event => toggleCollapsed(event)}
          onClick={event => toggleCollapsed(event)}
        >
          <CaretIcon className={styles.CaretIcon} /> {title}
          <span>({items.length})</span>
        </Heading>
      )}
      <div
        className={styles.Panel}
        style={{
          height: rowHeight === 'auto' ? rowHeight : cssCalcExpr,
          transitionDuration: cssTransitionDurationMS,
        }}
      >
        <table className={styles.Table}>
          <thead>
            <tr className={styles.TableRow}>
              <th>&nbsp;</th>
              {displayProps &&
                entries(displayProps).map(([, label]) => (
                  <th className={styles.DisplayProp}>{label}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr className={styles.TableRow}>
                <td className={styles.DisplayPropTitle}>
                  <ButtonLink to={`${AppRoutes.ZORG}/${item.id}`}>
                    {item.title}
                  </ButtonLink>
                </td>
                {displayProps &&
                  entries(displayProps).map(([key]) => (
                    <td className={styles.DisplayProp}>
                      {item[key] || <span>&mdash;</span>}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
