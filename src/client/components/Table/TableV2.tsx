import { Link } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { ReactNode } from 'react';
import {
  capitalizeFirstLetter,
  entries,
  keys,
} from '../../../universal/helpers';
import { LinkProps, Unshaped } from '../../../universal/types';
import styles from './TableV2.module.scss';

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
  displayProps?: DisplayProps<T> | null;
  gridColStyles?: string[];
}

export function TableV2<T extends ObjectWithOptionalId>({
  items,
  displayProps,
  titleKey = 'title',
  className,
  gridColStyles,
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
    <table
      className={classnames(
        styles.Table,
        !!gridColStyles && styles.Table__grid,
        className
      )}
    >
      {hasDisplayPropTableHeadingLabels && (
        <thead>
          <tr
            className={classnames(
              styles.TableRow,
              !!gridColStyles && styles.TableRow__Grid
            )}
          >
            {!!items[0] && titleKey in items[0] && (
              <FirstHeadCellTag className={gridColStyles?.[0]}>
                {displayPropsFinal[titleKey]}
              </FirstHeadCellTag>
            )}
            {displayPropEntries.map(([key, label], index) => {
              const HeadingCellElement = !!label ? 'th' : 'td';
              return (
                <HeadingCellElement
                  key={`th-${key}`}
                  className={
                    gridColStyles?.[index + (titleKey in items?.[0] ? 1 : 0)]
                  }
                >
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
            className={classnames(
              styles.TableRow,
              !!gridColStyles && styles.TableRow__Grid
            )}
          >
            {titleKey in item && (
              <td
                className={classnames(
                  styles.DisplayPropTitle,
                  gridColStyles?.[0]
                )}
              >
                {item[titleKey]}
              </td>
            )}
            {displayPropEntries.map(([key, label], index) => (
              <td
                key={`td-${key}`}
                className={gridColStyles?.[index + (titleKey in item ? 1 : 0)]}
              >
                {item[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
