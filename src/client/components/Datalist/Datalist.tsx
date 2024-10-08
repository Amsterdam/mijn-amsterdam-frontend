import { ReactNode } from 'react';
import styles from './Datalist.module.scss';
import classNames from 'classnames';

export interface Row {
  label: ReactNode;
  content: ReactNode;
  classNameLabel?: string;
  classNameContent?: string;
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

interface WrappedRow {
  label: ReactNode;
  content: ReactNode;
  className?: string;
}

function DatalistRowWrapped({ label, content, className }: WrappedRow) {
  return (
    <div className={className}>
      <dt className={styles.Datalist__title}>{label}</dt>
      <dd className={styles.Datalist__description}>{content}</dd>
    </div>
  );
}

export interface RowSet {
  rows: WrappedRow[];
  className?: string;
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
      {rows.map((row) => (
        <DatalistRowWrapped
          key={`row-${row.label}`}
          label={row.label}
          content={row.content}
          className={row.className}
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
        .filter(Boolean)
        .map((row: Row | RowSet, index) =>
          'rows' in row ? (
            <DatalistRowsWithWrapper key={`row-${index}`} rows={row.rows} />
          ) : (
            <DatalistRow
              key={`row-${index}`}
              label={row.label}
              content={row.content}
              classNameLabel={row.classNameLabel}
              classNameContent={row.classNameContent}
            />
          )
        )}
    </dl>
  );
}
