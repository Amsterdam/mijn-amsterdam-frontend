import React from 'react';
import styles from './InfoPanel.module.scss';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';

function InfoPanelActionLinks({ actionLinks }) {
  return (
    <ul className={styles.InfoPanelActionLinks}>
      {actionLinks.map((actionLink, index) => (
        <li key={actionLink.label}>
          <ButtonLink
            external={actionLink.external || false}
            to={actionLink.url}
          >
            {actionLink.label}
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}

function InfoPanelTable({ data = {} }) {
  return (
    <table className={styles.InfoPanelTable}>
      <tbody>
        {Object.entries(data)
          .filter(([, value]) => !!value)
          .map(([label, value], index) => {
            return (
              <tr key={label}>
                <th>{label}</th>
                <td>{value}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

export default function InfoPanel({ title = '', actionLinks = [], info = {} }) {
  return (
    <div className={styles.InfoPanel}>
      {!!title && <Heading>{title}</Heading>}
      <div className={styles.InfoPanelContent}>
        <InfoPanelTable data={info} />
        {!!actionLinks.length && (
          <InfoPanelActionLinks actionLinks={actionLinks} />
        )}
      </div>
    </div>
  );
}
