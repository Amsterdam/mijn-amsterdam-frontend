import { ReactNode } from 'react';

import {
  Grid,
  GridColumnNumber,
  GridColumnNumbers,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './Datalist.module.scss';

export interface Row {
  label: ReactNode;
  content: ReactNode;
  classNameLabel?: string;
  classNameContent?: string;
  isVisible?: boolean;
}

export function DatalistRow({
  label,
  content,
  classNameLabel,
  classNameContent,
}: Row) {
  return (
    <>
      <dt className={classNames(styles.Datalist__title, classNameLabel)}>
        {label}
      </dt>
      <dd
        className={classNames(styles.Datalist__description, classNameContent)}
      >
        {content}
      </dd>
    </>
  );
}

export interface WrappedRow {
  label: ReactNode;
  content: ReactNode;
  className?: string;
  isVisible?: boolean;
  span?: GridColumnNumber | GridColumnNumbers;
  start?: GridColumnNumber | GridColumnNumbers;
}

function DatalistRowWrapped({
  label,
  content,
  className,
  span,
  start,
}: WrappedRow) {
  return (
    <Grid.Cell span={span} start={start} className={className}>
      <dt className={styles.Datalist__title}>{label}</dt>
      <dd className={styles.Datalist__description}>{content}</dd>
    </Grid.Cell>
  );
}

export interface RowSet {
  rows: WrappedRow[];
  className?: string;
  isVisible?: boolean;
}

function DatalistRowsWithWrapper({ rows, className }: RowSet) {
  return (
    <div
      className={classNames(
        'ams-grid',
        styles['Datalist__row-wrapper'],
        className
      )}
    >
      {rows
        .filter((row) =>
          typeof row.isVisible !== 'undefined' ? row.isVisible : true
        )
        .map((row) => (
          <DatalistRowWrapped
            key={`row-${row.label}`}
            label={row.label}
            content={row.content}
            className={row.className}
            isVisible={row.isVisible}
            span={row.span}
            start={row.start}
          />
        ))}
    </div>
  );
}

export interface DatalistProps {
  rows: Array<Row | RowSet>;
  className?: string;
  rowVariant?: 'horizontal' | 'vertical';
}

export function Datalist({
  className,
  rowVariant = 'vertical',
  rows,
}: DatalistProps) {
  return (
    <dl
      className={classNames(
        styles.Datalist,
        rowVariant === 'horizontal' && styles['has-horizontal-rows'],
        className
      )}
    >
      {rows
        .filter((row) =>
          !!row && typeof row.isVisible !== 'undefined' ? row.isVisible : true
        )
        .map((row: Row | RowSet, index) =>
          'rows' in row ? (
            <DatalistRowsWithWrapper
              isVisible={row.isVisible}
              key={`row-${index}`}
              rows={row.rows}
              className={row.className}
            />
          ) : (
            <DatalistRow
              key={`row-${index}`}
              label={row.label}
              content={row.content}
              isVisible={row.isVisible}
              classNameLabel={row.classNameLabel}
              classNameContent={row.classNameContent}
            />
          )
        )}
    </dl>
  );
}
