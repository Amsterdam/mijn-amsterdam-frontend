import {
  Heading,
  Icon,
  OrderedList,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { ChevronForwardIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './ZakenList.module.scss';
import type { LinkProps } from '../../../universal/types/App.types.ts';
import { MaRouterLink } from '../MaLink/MaLink.tsx';
import type { DisplayProps } from '../Table/TableV2.tsx';
import { useDisplayPropsEntries } from '../Table/useDisplayPropEntries.hook.ts';

function LinkOrFragment({
  children,
  link,
}: {
  children: React.ReactNode;
  link?: LinkProps;
}) {
  if (link?.to) {
    return (
      <MaRouterLink
        href={link.to}
        maVariant="fatNoUnderline"
        className={styles.ZakenListLink}
      >
        {children}
        <Icon svg={ChevronForwardIcon} className={styles.IconFW} aria-hidden />
      </MaRouterLink>
    );
  }
  return <>{children}</>;
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
  const firstZaak = zaken[0] ?? ({} as T);
  const titleAttribute = (
    firstZaak[displayPropEntries[0][0] as keyof T]
      ? displayPropEntries[0][0]
      : typeof firstZaak.title === 'string'
        ? 'title'
        : Object.keys(firstZaak).filter(
            (key) =>
              firstZaak[key as keyof T] &&
              typeof firstZaak[key as keyof T] !== 'object'
          )[0]
  ) as keyof T;

  return (
    <UnorderedList
      markers={false}
      className={classNames(styles.ListView, className)}
    >
      {zaken.map((zaak, index) => {
        const key = String(
          ('id' in zaak ? zaak.id : `item-${index}`) ?? `article-${index}`
        );
        return (
          <OrderedList.Item key={key} className={styles.ListViewItem}>
            <LinkOrFragment link={zaak.link}>
              <article className={styles.ListViewArticle}>
                <Heading level={4} size="level-4">
                  {zaak[titleAttribute] as React.ReactNode}
                </Heading>

                <Paragraph>
                  {displayPropEntries
                    .slice(1)
                    .map(([propKey, { label }], i) => (
                      <span key={propKey} className={styles.ListViewProp}>
                        <strong>{label}:</strong>{' '}
                        {zaak[propKey as keyof T] as React.ReactNode}
                      </span>
                    ))}
                </Paragraph>
              </article>
            </LinkOrFragment>
          </OrderedList.Item>
        );
      })}
    </UnorderedList>
  );
}
