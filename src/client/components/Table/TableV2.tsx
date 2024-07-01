import { Link, Table } from '@amsterdam/design-system-react';
import { ReactNode } from 'react';
import { capitalizeFirstLetter, entries } from '../../../universal/helpers';
import { LinkProps, Unshaped } from '../../../universal/types';
import styles from './TableV2.module.scss';
import classNames from 'classnames';

interface ObjectWithOptionalLinkAttr extends Unshaped {
  link?: LinkProps;
}

export function addTitleLinkComponent<T extends ObjectWithOptionalLinkAttr>(
  items: T[],
  titleKey: keyof T = 'title'
) {
  return items.map((item) => {
    if (!item.link?.to) {
      return item;
    }

    let title: string = item[titleKey];
    if (typeof title !== 'string') {
      title = 'Onbekend item';
    }

    return {
      ...item,
      [titleKey]: (
        <Link href={item.link.to}>{capitalizeFirstLetter(title)}</Link>
      ),
    };
  });
}

export type DisplayProps<T> = {
  [Property in keyof T]+?: string | number | ReactNode;
};

export interface TableV2Props<T> {
  displayProps: DisplayProps<T> | null;
  items: T[];
  className?: string;
  showTHead?: boolean;
  caption?: string;
}

export function TableV2<T extends Unshaped>({
  caption,
  items,
  displayProps,
  className,
  showTHead = true,
}: TableV2Props<T>) {
  const displayPropEntries = displayProps !== null ? entries(displayProps) : [];

  return (
    <Table className={classNames(styles.TableV2, className)}>
      {!!caption && <Table.Caption>{caption}</Table.Caption>}
      {showTHead && (
        <Table.Header>
          <Table.Row>
            {displayPropEntries.map(([key, label], index) => {
              if (!!label) {
                return (
                  <Table.HeaderCell key={`th-${key}`}>{label}</Table.HeaderCell>
                );
              }
              return <Table.Cell key={`th-${key}`}>{label}</Table.Cell>;
            })}
          </Table.Row>
        </Table.Header>
      )}
      <Table.Body>
        {items.map((item, index) => (
          <Table.Row key={'id' in item ? item.id : undefined ?? `tr-${index}`}>
            {displayPropEntries.map(([key, label], index) => (
              <Table.Cell key={`td-${key}`}>{item[key]}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
