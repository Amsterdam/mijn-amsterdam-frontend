import { isValidElement, useMemo } from 'react';

import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import slug from 'slugme';

import styles from './InfoPanel.module.scss';
import { personalDetailFields } from './personalDetailFields';
import { entries } from '../../../universal/helpers/utils';
import { Unshaped } from '../../../universal/types';
import Linkd from '../Button/Button';
import SectionCollapsible from '../SectionCollapsible/SectionCollapsible';

export interface ActionLink {
  title: string;
  url: string;
  external?: boolean;
  className?: string;
}

export type ActionLinksFormatter =
  | ActionLink[]
  | ((sourceData: any) => ActionLink[]);

export interface InfoPanelActionLinksProps {
  actionLinks: ActionLink[];
}

export interface InfoPanelTableProps {
  panelData: Unshaped;
  omitPairWithFalseyValues?: boolean;
}

export interface InfoPanelProps {
  id?: string;
  title?: string;
  actionLinks?: ActionLink[];
  panelData: Unshaped | Unshaped[];
  className?: string;
  omitPairWithFalseyValues?: boolean;
}

export interface InfoPanelCollapsibleProps extends InfoPanelProps {
  id: string;
  startCollapsed?: boolean;
}

function isPersonalDetailField(field: string) {
  return personalDetailFields.includes(field.toLocaleLowerCase());
}

function InfoPanelActionLinks({ actionLinks }: InfoPanelActionLinksProps) {
  return (
    <ul className={styles.InfoPanelActionLinks}>
      {actionLinks.map((actionLink) => (
        <li key={actionLink.title}>
          <Linkd
            className={actionLink.className || ''}
            href={actionLink.url}
            external={actionLink.external}
          >
            {actionLink.title}
          </Linkd>
        </li>
      ))}
    </ul>
  );
}

function getValue(value: any) {
  if (isValidElement(value)) {
    return value;
  }
  if (Array.isArray(value) || typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return '';
    }
  }
  return value;
}

function filterValue(
  omitPairWithFalseyValues: boolean = true,
  [, value]: [string, string | number]
) {
  return omitPairWithFalseyValues ? !!value : true;
}

function InfoPanelTable({
  panelData = {},
  omitPairWithFalseyValues = true,
}: InfoPanelTableProps) {
  const tables = useMemo(() => {
    return Array.isArray(panelData)
      ? panelData.map((panelData) =>
          entries(panelData).filter(
            filterValue.bind(null, omitPairWithFalseyValues)
          )
        )
      : [
          entries(panelData).filter(
            filterValue.bind(null, omitPairWithFalseyValues)
          ),
        ];
  }, [panelData, omitPairWithFalseyValues]);

  return (
    <div className={styles.Tables}>
      {tables.map((rows, index) => (
        <div className={styles.TableWrap} key={index}>
          <table className={styles.InfoPanelTable}>
            <tbody>
              {rows.map(([title, value], index) => {
                return (
                  <tr
                    key={title + index}
                    className={`InfoPanelTableRow__${slug(title, {
                      lower: true,
                    })}`}
                  >
                    <th>
                      <span>{title}</span>
                    </th>
                    <td translate={isPersonalDetailField(title) ? 'no' : 'yes'}>
                      {getValue(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default function InfoPanel({
  id,
  title = '',
  actionLinks = [],
  panelData = {},
  className,
  omitPairWithFalseyValues = true,
}: InfoPanelProps) {
  return (
    <div id={id} className={classnames(styles.InfoPanel, className)}>
      {!!title && (
        <Heading className={styles.Title} level={3} size="level-3">
          {title}
        </Heading>
      )}
      <div
        className={classnames(
          styles.InfoPanelContent,
          !!title &&
            `${styles.InfoPanelContent}__${slug(title, { lower: true })}`,
          slug(title, { lower: true })
        )}
      >
        <InfoPanelTable
          omitPairWithFalseyValues={omitPairWithFalseyValues}
          panelData={panelData}
        />
        <InfoPanelActionLinks actionLinks={actionLinks || []} />
      </div>
    </div>
  );
}

export function InfoPanelCollapsible({
  id,
  title = '',
  className,
  actionLinks = [],
  panelData = {},
  startCollapsed = true,
}: InfoPanelCollapsibleProps) {
  return (
    <SectionCollapsible
      id={`InfoPanelCollapsible-${id}`}
      className={styles.InfoPanelCollapsible}
      title={title}
      isLoading={false}
      hasItems={true}
    >
      <InfoPanel
        id={id}
        className={className}
        actionLinks={actionLinks}
        panelData={panelData}
      />
    </SectionCollapsible>
  );
}
