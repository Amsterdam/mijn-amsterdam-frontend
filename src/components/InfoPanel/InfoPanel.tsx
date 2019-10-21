import React from 'react';
import styles from './InfoPanel.module.scss';
import ButtonLink from 'components/Button/Button';
import Heading from 'components/Heading/Heading';
import { Unshaped } from 'App.types';
import { entries } from 'helpers/App';
import classnames from 'classnames';
import slug from 'slug';
import { trackLink } from 'hooks/analytics.hook';

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
          <ButtonLink
            to={actionLink.url}
            rel={actionLink.external ? 'external' : ''}
            onClick={() => {
              actionLink.external && trackLink(actionLink.url);
            }}
          >
            {actionLink.title}
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}

export interface InfoPanelTableProps {
  panelData: Unshaped;
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
                <td>{value}</td>
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
