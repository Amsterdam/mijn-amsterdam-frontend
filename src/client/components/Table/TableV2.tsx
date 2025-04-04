import { ReactNode } from 'react';

import { Heading, Table } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { getDisplayPropsForScreenSize } from './helpers';
import styles from './TableV2.module.scss';
import { TableV2Props } from './TableV2.types';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps, Unshaped, ZaakDetail } from '../../../universal/types';
import { usePhoneScreen } from '../../hooks/media.hook';
import { MaRouterLink } from '../MaLink/MaLink';

export type { DisplayProps } from './TableV2.types';

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
  linkTitle?: (item: T) => string,
  linkName: string = 'link'
): WithDetailLinkComponent<T>[] {
  return items.map((item) => {
    if (!item[linkName]?.to) {
      return item;
    }

    let label: string =
      item[propertyName as keyof T] ?? item?.[linkName]?.[propertyName];
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
        <MaRouterLink
          maVariant="fatNoUnderline"
          title={linkTitle ? linkTitle(item) : `Bekijk meer over ${label}`}
          href={item[linkName].to}
        >
          {capitalizeFirstLetter(label)}
        </MaRouterLink>
      ),
    };
  });
}

export function TableV2<T extends object = ZaakDetail>({
  caption,
  subTitle,
  items,
  displayProps,
  className,
  showTHead = true,
}: TableV2Props<T>) {
  const isPhoneScreen = usePhoneScreen();
  const props = getDisplayPropsForScreenSize(displayProps, isPhoneScreen);
  const displayPropEntries = entries(props);

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
                      {item[key as keyof T] as ReactNode}
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
