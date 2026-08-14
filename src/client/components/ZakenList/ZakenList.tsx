import { isValidElement } from 'react';

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
import type { DisplayProps } from '../Table/TableV2.tsx';
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
  T extends { link?: LinkProps; title: string },
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

type ZakenListProps<T> = {
  zaken: T[];
  className?: string;
  displayProps: DisplayProps<T>;
};

export function ZakenList<T extends { link?: LinkProps; title: string }>({
  zaken,
  className,
  displayProps,
}: ZakenListProps<T>) {
  const displayPropEntries = useDisplayPropsEntries(displayProps);

  const titleAttribute = getTitleAttribute(zaken);

  return (
    <UnorderedList
      markers={false}
      className={classNames(styles.ListView, className)}
    >
      {zaken.map((zaak, index) => {
        const key =
          'id' in zaak && zaak.id != null ? String(zaak.id) : `item-${index}`;

        return (
          <>
            <OrderedList.Item key={key}>
              <LinkOrFragment link={zaak.link}>
                <article className={styles.ListViewArticle}>
                  <Heading level={4} size="level-4">
                    {zaak[titleAttribute] as React.ReactNode}
                  </Heading>

                  <Paragraph>
                    {displayPropEntries.slice(1).map(([propKey, { label }]) => {
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
            </OrderedList.Item>
            <ListDivider listLength={zaken.length} index={index} />
          </>
        );
      })}
    </UnorderedList>
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
  return null;
}
