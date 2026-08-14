import { Fragment, isValidElement } from 'react';

import {
  Column,
  Heading,
  Icon,
  OrderedList,
  Paragraph,
  Row,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { ChevronForwardIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './ZakenList.module.scss';
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
        <Row align="between">
          <Column>{children}</Column>
          <Column align="center">
            <Icon svg={ChevronForwardIcon} aria-hidden />
          </Column>
        </Row>
      </LinkComponent>
    );
  }
  return <>{children}</>;
}

export function getTitleAttribute<
  T extends { link?: LinkProps; title?: string },
>(zaken: T[]) {
  const firstZaak = zaken[0] ?? ({} as T);
  if (firstZaak.title) {
    return 'title' as keyof T;
  }
  return Object.keys(firstZaak).filter(
    (key) =>
      firstZaak[key as keyof T] && typeof firstZaak[key as keyof T] !== 'object'
  )[0] as keyof T;
}

export function getLabelValue(value: unknown) {
  if (isValidElement(value)) {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
export function ZakenList<T extends { link?: LinkProps; title?: string }>({
  caption,
  items,
  className,
  displayProps,
  contentAfterTheCaption,
}: TableV2Props<T>) {
  const displayPropEntries = useDisplayPropsEntries(displayProps);

  const titleAttribute = getTitleAttribute(items);

  return (
    <>
      {!!caption && (
        <Heading level={2} size="level-2" className="ams-mb-s">
          {caption}
        </Heading>
      )}
      {!!contentAfterTheCaption && (
        <div className="ams-mb-s">{contentAfterTheCaption}</div>
      )}
      <UnorderedList
        markers={false}
        className={classNames(styles.ListView, className)}
      >
        {items.map((zaak, index) => {
          const key =
            'id' in zaak && zaak.id != null ? String(zaak.id) : `item-${index}`;

          return (
            <Fragment key={key}>
              <OrderedList.Item>
                <LinkOrFragment link={zaak.link}>
                  <article className={styles.ListViewArticle}>
                    <Heading level={4} size="level-4">
                      {zaak[titleAttribute] as React.ReactNode}
                    </Heading>

                    <Paragraph>
                      {displayPropEntries
                        .slice(1)
                        .map(([propKey, { label }]) => {
                          const value = zaak[propKey as keyof T];
                          return (
                            <span key={propKey}>
                              <strong>{label}:</strong> {getLabelValue(value)}
                            </span>
                          );
                        })}
                    </Paragraph>
                  </article>
                </LinkOrFragment>
                <ListDivider listLength={items.length} index={index} />
              </OrderedList.Item>
            </Fragment>
          );
        })}
      </UnorderedList>
    </>
  );
}

type ListDividerProps = {
  listLength: number;
  index: number;
};

export function ListDivider({ listLength, index }: ListDividerProps) {
  if (index < listLength - 1) {
    return <hr className={styles.ListDivider} />;
  }

  return <div className="ams-mb-m" />;
}
