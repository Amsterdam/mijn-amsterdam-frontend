import React from 'react';
import styles from './MyTips.module.scss';
import ButtonLink, {
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';
import { AppRoutes } from 'App.constants';
import { MyTip } from 'hooks/api/my-tips-api.hook';
import LoadingContent from '../LoadingContent/LoadingContent';
import { ReactComponent as ImgPlaceholder } from 'assets/images/img-placeholder.svg';

export interface TipProps {
  tip: MyTip;
}

const Tip = ({ tip }: TipProps) => (
  <li className={styles.TipItem}>
    <div className={styles.ImageContainer}>
      {tip.imgUrl ? (
        <img src={tip.imgUrl} />
      ) : (
        <ImgPlaceholder aria-hidden="true" className={styles.ImgPlaceholder} />
      )}
    </div>
    <Heading el="h4">{tip.title}</Heading>
    <p>{tip.description}</p>
    <ButtonLinkExternal title="Meer informatie over deze tip" to={tip.link.to}>
      {tip.link.title}
    </ButtonLinkExternal>
  </li>
);

export interface MyTipsProps {
  items: MyTip[];
  isLoading: boolean;
  showHeader?: boolean;
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

export default function MyTips({
  items = [],
  isLoading = true,
  showHeader = true,
}: MyTipsProps) {
  return (
    <div className={styles.MyTips}>
      {showHeader && (
        <div className={styles.HeaderBar}>
          <Heading size="large">Mijn tips</Heading>
          {!!items.length && (
            <ButtonLink to={AppRoutes.MY_TIPS}>Mijn tips</ButtonLink>
          )}
          {/* <a href="" className={styles.OptIn}>
          Maak relevanter
        </a> */}
        </div>
      )}

      <ul className={styles.TipsList}>
        {isLoading && <LoadingContentListItems />}
        {items.map((item, i) => (
          <Tip key={item.title} tip={item} />
        ))}
      </ul>
      {!isLoading && !items.length && (
        <p>We hebben op dit moment geen persoonlijke tips voor u.</p>
      )}
    </div>
  );
}
