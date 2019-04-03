import React from 'react';
import styles from './MyTips.module.scss';
import ButtonLink, {
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';

const Tip = ({ tip }) => (
  <React.Fragment>
    <div className={styles.Placeholder} />
    <h4>{tip.title}</h4>
    <p>{tip.description}</p>
    <ButtonLinkExternal to={tip.link.to}>{tip.link.label}</ButtonLinkExternal>
  </React.Fragment>
);

export default function MyTips({ items }) {
  return (
    <div className={styles.MyTips}>
      <div className={styles.HeaderBar}>
        <h2>Mijn tips</h2>
        <ButtonLink to="">Mijn tips</ButtonLink>
        <a href="" className={styles.OptIn}>
          Maak relevanter
        </a>
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <Tip tip={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
