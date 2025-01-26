import { ReactNode } from 'react';

import { Heading, Table } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './TableV2.module.scss';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps, Unshaped, ZaakDetail } from '../../../universal/types';
import { MaRouterLink } from '../MaLink/MaLink';

interface ObjectWithOptionalLinkAttr extends Unshaped {
  link?: LinkProps;
}

export type WithDetailLinkComponent<T> = T & {
  detailLinkComponent?: ReactNode;
};

export function addLinkElementToProperty<T extends ObjectWithOptionalLinkAttr>(
  items: T[],
  propertyName: keyof T | keyof T['link'] = 'title',
  addDetailLinkComponentAttr = false,
  linkName = 'link'
): WithDetailLinkComponent<T>[] {
  return items.map((item) => {
    if (!item[linkName]?.to) {
      return item;
    }

    let label: string = item[propertyName] ?? item?.[linkName]?.[propertyName];
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
        <MaRouterLink maVariant="fatNoUnderline" href={item[linkName].to}>
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
  subTitle?: ReactNode;
}

export function TableV2<T extends object = ZaakDetail>({
  caption,
  subTitle,
  items,
  displayProps,
  className,
  showTHead = true,
}: TableV2Props<T>) {
  const displayPropEntries = displayProps !== null ? entries(displayProps) : [];
  return (
    <>
      {!!caption && (
        <Heading level={3} size="level-2">
          {caption}
        </Heading>
      )}
      {subTitle}
      <Table className={classNames(styles.TableV2, className)}>
        {showTHead && (
          <Table.Header>
            <Table.Row>
              {displayPropEntries.map(([key, label]) => {
                if (label) {
                  return (
                    <Table.HeaderCell key={`th-${key}`}>
                      {label}
                    </Table.HeaderCell>
                  );
                }
                return <Table.Cell key={`th-${key}`}>{label}</Table.Cell>;
              })}
            </Table.Row>
          </Table.Header>
        )}
        <Table.Body>
          {items.map((item, index) => {
            const key = String(
              ('id' in item ? item.id : `item-${index}`) ?? `tr-${index}`
            );
            return (
              <Table.Row key={key}>
                {displayPropEntries.map(([key]) => {
                  return (
                    <Table.Cell key={`td-${key}`}>
                      {item[key] as ReactNode}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
}
