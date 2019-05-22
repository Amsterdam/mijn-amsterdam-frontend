import React from 'react';
import styles from './MyTips.module.scss';
import ButtonLink, {
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';
import { AppRoutes } from 'App.constants';
import { MyTip } from 'hooks/api/my-tips-api.hook';
import LoadingContent from '../LoadingContent/LoadingContent';

export interface TipProps {
  tip: MyTip;
}

const Tip = ({ tip }: TipProps) => (
  <li className={styles.TipItem}>
    <div className={styles.ImageContainer} />
    <Heading el="h4">{tip.title}</Heading>
    <p>{tip.description}</p>
    <ButtonLinkExternal to={tip.link.to}>{tip.link.title}</ButtonLinkExternal>
  </li>
);

export interface MyTipsProps {
  items: MyTip[];
  isLoading: boolean;
}

function LoadingContentListItems() {
  const elements = [];
  const barConfig = [
    ['100%', '19rem', '2rem'],
    ['50%', '2rem', '1rem'],
    ['90%', '2rem', '1rem'],
    ['80%', '2rem', '1rem'],
  ];
  for (let i = 0; i < 3; i++) {
    elements.push(
      <li className={styles.TipItem} key={i}>
        <LoadingContent barConfig={barConfig} />
      </li>
    );
  }
  return <>{elements}</>;
}

export default function MyTips({ items = [], isLoading = true }: MyTipsProps) {
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
        {isLoading && <LoadingContentListItems />}
        {items.map((item, i) => (
          <Tip key={item.title} tip={item} />
        ))}
      </ul>
      {!isLoading && !items.length && (
        <p>We hebben op het moment geen tips voor u</p>
      )}
    </div>
  );
}
