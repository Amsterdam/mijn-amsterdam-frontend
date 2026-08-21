import { isValidElement } from 'react';

import {
  Heading,
  Icon,
  Paragraph,
  Row,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { ChevronForwardIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './DataViewList.module.scss';
import type { LinkProps } from '../../../universal/types/App.types.ts';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';
import type { TableV2Props } from '../Table/TableV2.types.ts';
import { useDisplayPropsEntries } from '../Table/useDisplayPropEntries.hook.ts';

export function LinkOrFragment({
  children,
  link,
}: {
  children: React.ReactNode;
  link?: LinkProps;
}) {
  if (link?.to) {
    const LinkComponent = link.to.startsWith('http') ? MaLink : MaRouterLink;
    return (
      <LinkComponent href={link.to} maVariant="fatNoUnderline">
        <Row align="between" alignVertical="center">
          {children}
          <Icon
            svg={ChevronForwardIcon}
            aria-hidden
            className={styles.ListViewIcon}
          />
        </Row>
      </LinkComponent>
    );
  }
  return <>{children}</>;
}

export function getTitleAttribute<
  T extends { link?: LinkProps; title?: string },
>(
  zaken: T[],
  displayPropEntries: ReadonlyArray<readonly [string, unknown]>
): keyof T {
  const firstZaak = zaken[0] ?? ({} as T);
  const firstDisplayPropKey = displayPropEntries[0]?.[0];

  if (firstDisplayPropKey && firstZaak[firstDisplayPropKey as keyof T]) {
    return firstDisplayPropKey as keyof T;
  }

  if (typeof firstZaak.title === 'string') {
    return 'title' as keyof T;
  }

  const firstTruthyPrimitiveKey = Object.keys(firstZaak).filter(
    (key) =>
      firstZaak[key as keyof T] &&
      typeof firstZaak[key as keyof T] !== 'object' &&
      key !== null
  )[0] as keyof T;

  return firstTruthyPrimitiveKey;
}

export function formatPropValueForDisplay<T>(value: T[keyof T]) {
  const FALLBACK_VALUE = '';

  if (isValidElement(value)) {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  if (value === undefined || value === null) {
    return FALLBACK_VALUE;
  }

  return String(value);
}
export function DataViewList<T extends { link?: LinkProps; title?: string }>({
  caption,
  items,
  className,
  displayProps,
  contentAfterTheCaption,
}: TableV2Props<T>) {
  const displayPropEntries = useDisplayPropsEntries(displayProps);

  const titleAttribute = getTitleAttribute(items, displayPropEntries);

  return (
    <>
      {!!caption && (
        <Heading level={2} size="level-2" className="ams-mb-s">
          {caption}
        </Heading>
      )}
      {!!contentAfterTheCaption && <>{contentAfterTheCaption}</>}

      <UnorderedList
        markers={false}
        className={classNames(styles.ListView, className)}
      >
        {items.map((zaak, index) => {
          const key =
            'id' in zaak && zaak.id != null ? String(zaak.id) : `item-${index}`;

          return (
            <UnorderedList.Item
              key={key}
              className={classNames(
                styles.ListViewItem,
                index < items.length - 1 && styles.ListViewItemWithDivider
              )}
            >
              <LinkOrFragment link={zaak.link}>
                <article className={styles.ListViewArticle}>
                  <Heading level={4} size="level-4">
                    {zaak[titleAttribute] as React.ReactNode}
                  </Heading>
                  {displayPropEntries.slice(1).map(([propKey, { label }]) => {
                    const value = zaak[propKey as keyof T];
                    return (
                      <Paragraph key={propKey}>
                        <strong>{label}:</strong>{' '}
                        {formatPropValueForDisplay(value)}
                      </Paragraph>
                    );
                  })}
                </article>
              </LinkOrFragment>
            </UnorderedList.Item>
          );
        })}
      </UnorderedList>
    </>
  );
}
