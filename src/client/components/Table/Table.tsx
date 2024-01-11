import classnames from 'classnames';
import { isValidElement, ReactNode } from 'react';
import {
  capitalizeFirstLetter,
  entries,
  keys,
} from '../../../universal/helpers';
import { LinkProps, Unshaped } from '../../../universal/types';
import Linkd from '../Button/Button';
import styles from './Table.module.scss';
import InnerHtml from '../InnerHtml/InnerHtml';
import { Link } from '@amsterdam/design-system-react';
import { useHistory } from 'react-router-dom';
import { MARouterLink } from '../MaRouterLink/MaRouterLink';

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
        <Linkd href={item.link.to}>{capitalizeFirstLetter(title)}</Linkd>
      ),
    };
  });
}

export function addLinkElementToProperty<T extends ObjectWithOptionalLinkAttr>(
  items: T[],
  propertyName: keyof T = 'title'
) {
  return items.map((item) => {
    if (!item.link?.to) {
      return item;
    }

    let label: string = item[propertyName];
    if (typeof label !== 'string') {
      label = 'Onbekend item';
    }

    return {
      ...item,
      [propertyName]: (
        <MARouterLink fatNoUnderline href={item.link.to}>
          {capitalizeFirstLetter(label)}
        </MARouterLink>
      ),
    };
  });
}

type DisplayProps<T> = { [Property in keyof T]+?: string | number | ReactNode };

export interface TableProps<T> {
  items: T[];
  className?: string;
  titleKey?: keyof T | string;
  displayProps: DisplayProps<T>;
}

interface TdValueProps {
  value: string | number | ReactNode;
}

function TdValue({ value }: TdValueProps) {
  if (value !== '' && value !== 0 && !value) {
    return <span>&nbsp;</span>;
  }
  if (isValidElement(value)) {
    return value;
  }
  return <InnerHtml el="span">{value as string}</InnerHtml>;
}

export default function Table<T extends ObjectWithOptionalId>({
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
              <FirstHeadCellTag className={styles.DisplayProp}>
                {displayPropsFinal[titleKey]}
              </FirstHeadCellTag>
            )}
            {displayPropEntries.map(([key, label]) => {
              const EL = !!label ? 'th' : 'td';
              return (
                <EL key={`th-${key}`} className={styles.DisplayProp}>
                  {label}
                </EL>
              );
            })}
          </tr>
        </thead>
      )}
      <tbody>
        {items.map((item, index) => (
          <tr
            key={item.id || `${String(titleKey)}-${index}`}
            className={styles.TableRow}
          >
            {titleKey in item && (
              <td className={styles.DisplayPropTitle}>{item[titleKey]}</td>
            )}
            {displayPropEntries.map(([key, label]) => (
              <td key={`td-${key}`} className={styles.DisplayProp}>
                {!!label && (
                  <span className={styles.DisplayPropLabel}>{label}:</span>
                )}
                <TdValue value={item[key]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
