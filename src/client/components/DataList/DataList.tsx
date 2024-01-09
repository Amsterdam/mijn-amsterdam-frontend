import { ReactNode } from 'react';
import styles from './DataList.module.scss';
import classNames from 'classnames';

interface Row {
  label: ReactNode;
  content: ReactNode;
}

function DataListRow({ label, content }: Row) {
  return (
    <>
      <dt className={styles.DataList_title}>{label}</dt>
      <dd className={styles.DataList_description}>{content}</dd>
    </>
  );
}

interface WrappedRow {
  label: ReactNode;
  content: ReactNode;
  className?: string;
}

function DataListRowWrapped({ label, content, className }: WrappedRow) {
  return (
    <div className={className}>
      <dt className={styles.DataList_title}>{label}</dt>
      <dd className={styles.DataList_description}>{content}</dd>
    </div>
  );
}

interface RowSet {
  rows: WrappedRow[];
  className?: string;
}

function DataListRowsWithWrapper({ rows, className }: RowSet) {
  return (
    <div
      className={classNames(
        'amsterdam-grid',
        styles.DataList_rowWrapper,
        className
      )}
    >
      {rows.map((row) => (
        <DataListRowWrapped
          key={`row-${row.label}`}
          label={row.label}
          content={row.content}
          className={row.className}
        />
      ))}
    </div>
  );
}

interface DataListProps {
  rows: Row[] | RowSet[];
  className?: string;
}

export function DataList({ className, rows }: DataListProps) {
  return (
    <dl className={classNames(styles.DataList, className)}>
      {rows.map((row, index) =>
        'rows' in row ? (
          <DataListRowsWithWrapper key={`row-${index}`} rows={row.rows} />
        ) : (
          <DataListRow
            key={`row-${index}`}
            label={row.label}
            content={row.content}
          />
        )
      )}
    </dl>
  );
}
