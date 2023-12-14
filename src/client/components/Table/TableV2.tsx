import { Link } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { ReactNode } from 'react';
import { capitalizeFirstLetter, entries } from '../../../universal/helpers';
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

export type DisplayProps<T> = {
  [Property in keyof T]+?: string | number | ReactNode;
};

export interface TableV2Props<T> {
  items: T[];
  className?: string;
  displayProps: DisplayProps<T> | null;
  gridColStyles?: string[];
  showTHead?: boolean;
}

export function TableV2<T extends ObjectWithOptionalId>({
  items,
  displayProps,
  className,
  gridColStyles,
  showTHead = true,
}: TableV2Props<T>) {
  const displayPropEntries = displayProps !== null ? entries(displayProps) : [];

  return (
    <table
      className={classnames(
        styles.Table,
        !!gridColStyles?.length && styles.Table__grid,
        className
      )}
    >
      {showTHead && (
        <thead>
          <tr
            className={classnames(
              styles.TableRow,
              !!gridColStyles?.length && [
                'amsterdam-grid',
                styles.TableRow__Grid,
              ]
            )}
          >
            {displayPropEntries.map(([key, label], index) => {
              const HeadingCellElement = !!label ? 'th' : 'td';
              return (
                <HeadingCellElement
                  key={`th-${key}`}
                  className={gridColStyles?.[index]}
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
            key={item.id ?? `tr-${index}`}
            className={classnames(
              styles.TableRow,
              !!gridColStyles?.length && [
                'amsterdam-grid',
                styles.TableRow__Grid,
              ]
            )}
          >
            {displayPropEntries.map(([key, label], index) => (
              <td key={`td-${key}`} className={gridColStyles?.[index]}>
                {item[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
