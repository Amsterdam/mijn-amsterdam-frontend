import { ReactNode } from 'react';

import { Heading, Table } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { getDisplayProps, getDisplayPropsColWidths } from './helpers';
import styles from './TableV2.module.scss';
import {
  ObjectWithOptionalLinkAttr,
  TableV2Props,
  WithDetailLinkComponent,
  type ScreenSize,
  type TableV2ColWidths,
} from './TableV2.types';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { ZaakDetail } from '../../../universal/types/App.types';
import { useSmallScreen } from '../../hooks/media.hook';
import { MaRouterLink, MaLink } from '../MaLink/MaLink';

export const addMaRouterLinkToProperty =
  createLinkElementToPropertyAdder(MaRouterLink);

export const addMaLinkToProperty = createLinkElementToPropertyAdder(MaLink);

/**
 * @deprecated These exports should be removed in the future and replaced with import from the types file.
 */
export type { DisplayProps, WithDetailLinkComponent } from './TableV2.types';

function createLinkElementToPropertyAdder(
  LinkComponent: typeof MaRouterLink | typeof MaLink = MaRouterLink
) {
  function addLinkElementToProperty<T extends ObjectWithOptionalLinkAttr>(
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
          <LinkComponent
            maVariant="fatNoUnderline"
            title={linkTitle ? linkTitle(item) : `Bekijk meer over ${label}`}
            href={item[linkName].to}
          >
            {capitalizeFirstLetter(label)}
          </LinkComponent>
        ),
      };
    });
  }
  return addLinkElementToProperty;
}

function getColWidth(
  colWidths: TableV2ColWidths,
  size: ScreenSize,
  index: number
) {
  return colWidths[size]?.filter((value) => parseInt(value, 10) !== 0)[index];
}

export function TableV2<T extends object = ZaakDetail>({
  caption,
  subTitle,
  items,
  displayProps,
  className,
  showTHead = true,
}: TableV2Props<T>) {
  const isSmallScreen = useSmallScreen();
  const colWidths = getDisplayPropsColWidths(displayProps);
  const colWidthsForScreenSize = colWidths?.[isSmallScreen ? 'small' : 'large'];
  let displayPropEntries = entries(getDisplayProps(displayProps));
  // Filter out display properties that are not defined for the current screen size
  displayPropEntries = Array.isArray(colWidthsForScreenSize)
    ? displayPropEntries.filter(
        (_entry, index) => parseInt(colWidthsForScreenSize[index], 10) !== 0
      )
    : displayPropEntries;

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
              {displayPropEntries.map(([key, label], index) => {
                if (label) {
                  return (
                    <Table.HeaderCell
                      key={`th-${key}`}
                      style={{
                        width: colWidths
                          ? getColWidth(
                              colWidths,
                              isSmallScreen ? 'small' : 'large',
                              index
                            )
                          : undefined,
                      }}
                    >
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
            const className =
              'className' in item && item.className
                ? (item.className as string)
                : '';
            return (
              <Table.Row key={key} className={className}>
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
