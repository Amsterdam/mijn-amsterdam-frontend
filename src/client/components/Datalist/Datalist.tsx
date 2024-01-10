import { ReactNode } from 'react';
import styles from './Datalist.module.scss';
import classNames from 'classnames';

interface Row {
  label: ReactNode;
  content: ReactNode;
}

function DatalistRow({ label, content }: Row) {
  return (
    <>
      <dt className={styles.Datalist__title}>{label}</dt>
      <dd className={styles.Datalist__description}>{content}</dd>
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

interface RowSet {
  rows: WrappedRow[];
  className?: string;
}

function DatalistRowsWithWrapper({ rows, className }: RowSet) {
  return (
    <div
      className={classNames(
        'amsterdam-grid',
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

interface DatalistProps {
  rows: Row[] | RowSet[];
  className?: string;
}

export function Datalist({ className, rows }: DatalistProps) {
  return (
    <dl className={classNames(styles.Datalist, className)}>
      {rows.map((row, index) =>
        'rows' in row ? (
          <DatalistRowsWithWrapper key={`row-${index}`} rows={row.rows} />
        ) : (
          <DatalistRow
            key={`row-${index}`}
            label={row.label}
            content={row.content}
          />
        )
      )}
    </dl>
  );
}
