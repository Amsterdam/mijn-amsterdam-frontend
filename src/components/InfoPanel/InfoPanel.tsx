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

export interface InfoPanelActionLinksProps {
  actionLinks: ActionLink[];
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

export interface InfoPanelTableProps {
  panelData: Unshaped;
}

function getValue(value: any) {
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

function InfoPanelTable({ panelData = {} }: InfoPanelTableProps) {
  return (
    <table className={styles.InfoPanelTable}>
      <tbody>
        {entries(panelData)
          .filter(([, value]) => !!value)
          .map(([title, value], index) => {
            return (
              <tr
                key={title}
                className={`InfoPanelTableRow__${slug(title, { lower: true })}`}
              >
                <th>{title}</th>
                <td>{getValue(value)}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

export interface InfoPanelProps {
  title?: string;
  actionLinks?: ActionLink[];
  panelData: Unshaped;
}

export interface InfoPanelCollapsibleProps extends InfoPanelProps {
  id: string;
  startCollapsed?: boolean;
}

export function InfoPanelCollapsible({
  id,
  title = '',
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
      <InfoPanel actionLinks={actionLinks} panelData={panelData} />
    </SectionCollapsible>
  );
}

export default function InfoPanel({
  title = '',
  actionLinks = [],
  panelData = {},
}: InfoPanelProps) {
  return (
    <div className={styles.InfoPanel}>
      {!!title && <Heading>{title}</Heading>}
      <div
        className={classnames(
          styles.InfoPanelContent,
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
