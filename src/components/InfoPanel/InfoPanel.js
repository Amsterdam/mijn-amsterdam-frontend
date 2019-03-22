import React from 'react';
import styles from './InfoPanel.module.scss';

function InfoPanelActionLinks({ actionLinks }) {
  return (
    <ul className={styles.InfoPanelActionLinks}>
      {actionLinks.map((actionLink, index) => (
        <li key={`link-${index}`}>
          <a href={actionLink.url}>{actionLink.label}</a>
        </li>
      ))}
    </ul>
  );
}

function InfoPanelTable({ data = {} }) {
  return (
    <table className={styles.InfoPanelTable}>
      <tbody>
        {Object.entries(data).map(([label, value], index) => {
          return (
            <tr key={`row-${index}`}>
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
    <div key={title} className={styles.InfoPanel}>
      {title && <h3 className={styles.InfoPanelTitle}>{title}</h3>}
      <div className={styles.InfoPanelContent}>
        <InfoPanelTable data={info} />
        {!!actionLinks.length && (
          <InfoPanelActionLinks actionLinks={actionLinks} />
        )}
      </div>
    </div>
  );
}
