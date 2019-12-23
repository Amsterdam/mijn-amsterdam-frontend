import React from 'react';
import styles from './InfoPanel.module.scss';
import Linkd from 'components/Button/Button';
import Heading from 'components/Heading/Heading';
import { Unshaped } from 'App.types';
import { entries } from 'helpers/App';
import classnames from 'classnames';
import slug from 'slug';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import { useSessionStorage } from 'hooks/storage.hook';

export interface ActionLink {
  title: string;
  url: string;
  external?: boolean;
}

export type ActionLinksFormatter =
  | ActionLink[]
  | ((sourceData: any) => ActionLink[]);

export interface InfoPanelActionLinksProps {
  actionLinks: ActionLink[];
}

export interface InfoPanelTableProps {
  panelData: Unshaped;
}

export interface InfoPanelProps {
  id?: string;
  title?: string;
  actionLinks?: ActionLink[];
  panelData: Unshaped | Unshaped[];
  className?: string;
}

export interface InfoPanelCollapsibleProps extends InfoPanelProps {
  id: string;
  startCollapsed?: boolean;
}

function InfoPanelActionLinks({ actionLinks }: InfoPanelActionLinksProps) {
  return (
    <ul className={styles.InfoPanelActionLinks}>
      {actionLinks.map((actionLink, index) => (
        <li key={actionLink.title}>
          <Linkd href={actionLink.url} external={actionLink.external}>
            {actionLink.title}
          </Linkd>
        </li>
      ))}
    </ul>
  );
}

function getValue(value: any) {
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

function InfoPanelTable({ panelData = {} }: InfoPanelTableProps) {
  const tables = Array.isArray(panelData)
    ? panelData.map(panelData =>
        entries(panelData).filter(([, value]) => !!value)
      )
    : [entries(panelData).filter(([, value]) => !!value)];
  return (
    <>
      {tables.map((rows, index) => (
        <table key={index} className={styles.InfoPanelTable}>
          <tbody>
            {rows.map(([title, value], index) => {
              return (
                <tr
                  key={title + index}
                  className={`InfoPanelTableRow__${slug(title, {
                    lower: true,
                  })}`}
                >
                  <th>{title}</th>
                  <td>{getValue(value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </>
  );
}

export default function InfoPanel({
  id,
  title = '',
  actionLinks = [],
  panelData = {},
  className,
}: InfoPanelProps) {
  return (
    <div id={id} className={classnames(styles.InfoPanel, className)}>
      {!!title && <Heading className={styles.Title}>{title}</Heading>}
      <div
        className={classnames(
          styles.InfoPanelContent,
          !!title &&
            `${styles.InfoPanelContent}__${slug(title, { lower: true })}`,
          slug(title, { lower: true })
        )}
      >
        <InfoPanelTable panelData={panelData} />
        {!!actionLinks.length && (
          <InfoPanelActionLinks actionLinks={actionLinks} />
        )}
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
  const [isCollapsed, setCollapsed] = useSessionStorage(id, startCollapsed);
  return (
    <SectionCollapsible
      className={styles.InfoPanelCollapsible}
      title={title}
      isLoading={false}
      hasItems={true}
      isCollapsed={isCollapsed}
      onToggleCollapsed={() => setCollapsed(!isCollapsed)}
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
