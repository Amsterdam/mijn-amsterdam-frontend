import classnames from 'classnames';
import { isValidElement, ReactNode } from 'react';
import {
  capitalizeFirstLetter,
  entries,
  keys,
} from '../../../universal/helpers';
import { LinkProps, Unshaped } from '../../../universal/types';
import Linkd from '../Button/Button';
import styles from './TableV2.module.scss';
import InnerHtml from '../InnerHtml/InnerHtml';
import { Link } from '@amsterdam/design-system-react';

interface ObjectWithOptionalLinkAttr extends Unshaped {
  link?: LinkProps;
}

interface ObjectWithOptionalId extends Unshaped {
  id?: number | string;
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

type DisplayProps<T> = { [Property in keyof T]+?: string | number | ReactNode };

export interface TableProps<T> {
  items: T[];
  className?: string;
  titleKey?: keyof T | string;
  displayProps?: DisplayProps<T>;
}

export function TableV2<T extends ObjectWithOptionalId>({
  items,
  displayProps,
  titleKey = 'title',
  className,
}: TableProps<T>) {
  const defaultDisplayProps: DisplayProps<Unshaped> = { [titleKey]: ' ' };
  const displayPropsFinal = !displayProps ? defaultDisplayProps : displayProps;
  const displayPropEntries = entries(displayPropsFinal).filter(
    ([key]) => key !== titleKey
  );
  const hasDisplayPropTableHeadingLabels = !!keys(displayPropsFinal).filter(
    (titleKey) => !!displayPropsFinal[titleKey]
  ).length;
  const FirstHeadCellTag = !!displayPropsFinal[titleKey] ? 'th' : 'td';

  return (
    <table className={classnames(styles.Table, className)}>
      {hasDisplayPropTableHeadingLabels && (
        <thead>
          <tr className={styles.TableRow}>
            {!!items[0] && titleKey in items[0] && (
              <FirstHeadCellTag>{displayPropsFinal[titleKey]}</FirstHeadCellTag>
            )}
            {displayPropEntries.map(([key, label]) => {
              const HeadingCellElement = !!label ? 'th' : 'td';
              return (
                <HeadingCellElement key={`th-${key}`}>
                  {label}
                </HeadingCellElement>
              );
            })}
          </tr>
        </thead>
      )}
      <tbody>
        {items.map((item, index) => (
          <tr
            key={item.id ?? `${String(titleKey)}-${index}`}
            className={styles.TableRow}
          >
            {titleKey in item && (
              <td className={styles.DisplayPropTitle}>{item[titleKey]}</td>
            )}
            {displayPropEntries.map(([key, label]) => (
              <td key={`td-${key}`}>{item[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
