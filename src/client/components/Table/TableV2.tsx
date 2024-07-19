import { Table } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps, Unshaped, ZaakDetail } from '../../../universal/types';
import { MaRouterLink } from '../MaLink/MaLink';
import styles from './TableV2.module.scss';

interface ObjectWithOptionalLinkAttr extends Unshaped {
  link?: LinkProps;
}

export function addLinkElementToProperty<T extends ObjectWithOptionalLinkAttr>(
  items: T[],
  propertyName: keyof T = 'title',
  addDetailLinkComponentAttr: boolean = false
): Array<T & { detailLinkComponent?: ReactNode }> {
  return items.map((item) => {
    if (!item.link?.to) {
      return item;
    }

    let label: string = item[propertyName];
    let linkPropertyName = propertyName;

    if (typeof label !== 'string') {
      label = 'Onbekend item';
    }

    if (addDetailLinkComponentAttr) {
      linkPropertyName = 'detailLinkComponent';
    }

    return {
      ...item,
      [linkPropertyName]: (
        <MaRouterLink maVariant="fatNoUnderline" href={item.link.to}>
          {capitalizeFirstLetter(label)}
        </MaRouterLink>
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

export function TableV2<T extends ZaakDetail>({
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
            {displayPropEntries.map(([key, label], index) => {
              return (
                <Table.Cell key={`td-${key}`}>
                  {item[key] as ReactNode}
                </Table.Cell>
              );
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
