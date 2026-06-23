import type { ReactNode } from 'react';

import { Heading, Link, Table } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './TableV2.module.scss';
import type {
  ObjectWithOptionalLinkAttr,
  TableV2Props,
  WithDetailLinkComponent,
} from './TableV2.types.ts';
import { useDisplayPropsEntries } from './useDisplayPropEntries.hook.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import type { ZaakAanvraagDetail } from '../../../universal/types/App.types.ts';
import { MaRouterLink } from '../MaLink/MaLink.tsx';

/**
 * @deprecated These exports should be removed in the future and replaced with import from the types file.
 */
export type { DisplayProps, WithDetailLinkComponent } from './TableV2.types.ts';

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

    const title = linkTitle ? linkTitle(item) : `Bekijk meer over ${label}`;
    const href: string = item[linkName].to;
    const labelCapitalized = capitalizeFirstLetter(label);

    return {
      ...item,
      [linkPropertyName]: href.startsWith('http') ? (
        <Link href={href} rel="noopener noreferrer" title={title}>
          {labelCapitalized}
        </Link>
      ) : (
        <MaRouterLink maVariant="fatNoUnderline" title={title} href={href}>
          {labelCapitalized}
        </MaRouterLink>
      ),
    };
  });
}

export function TableV2<T extends object = ZaakAanvraagDetail>({
  caption,
  contentAfterTheCaption,
  items,
  displayProps,
  className,
  showTHead = true,
}: TableV2Props<T>) {
  const displayPropEntries = useDisplayPropsEntries(displayProps);

  return (
    <>
      {!!caption && (
        <Heading level={2} className={contentAfterTheCaption ? 'ams-mb-s' : ''}>
          {caption}
        </Heading>
      )}
      {contentAfterTheCaption}
      <Table className={classNames(styles.TableV2, className)}>
        {showTHead && (
          <Table.Header>
            <Table.Row>
              {displayPropEntries.map(([key, { label, width }]) => {
                if (label) {
                  const st = width ? { width } : undefined;
                  return (
                    <Table.HeaderCell key={`th-${key}`} style={st}>
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
