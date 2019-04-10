import React from 'react';
import styles from './MyTips.module.scss';
import ButtonLink, {
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';
import { AppRoutes } from 'App.constants';

const Tip = ({ tip }) => (
  <li className={styles.TipItem}>
    <div className={styles.ImageContainer} />
    <Heading el="h4">{tip.title}</Heading>
    <p>{tip.description}</p>
    <ButtonLinkExternal to={tip.link.to}>{tip.link.title}</ButtonLinkExternal>
  </li>
);

export default function MyTips({ items = [] }) {
  return (
    <div className={styles.MyTips}>
      <div className={styles.HeaderBar}>
        <Heading size="large">Mijn tips</Heading>
        <ButtonLink to={AppRoutes.MY_TIPS}>Mijn tips</ButtonLink>
        {/* <a href="" className={styles.OptIn}>
          Maak relevanter
        </a> */}
      </div>
      <ul className={styles.TipsList}>
        {items.map((item, i) => (
          <Tip key={item.title} tip={item} />
        ))}
      </ul>
    </div>
  );
}
