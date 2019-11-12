import React, { useState, useEffect } from 'react';
import styles from './MyTips.module.scss';
import Heading from 'components/Heading/Heading';
import { AppRoutes } from 'App.constants';
import { MyTip } from 'hooks/api/my-tips-api.hook';
import LoadingContent from '../LoadingContent/LoadingContent';
import Linkd from '../Button/Button';
import classnames from 'classnames';
import { Button } from '../Button/Button';
import MyTipsOptInOutModal from './MyTipsOptInOutModal';
import { ReactComponent as ChevronIcon } from 'assets/icons/Chevron-Right.svg';

export interface TipProps {
  tip: MyTip;
}

const Tip = ({ tip }: TipProps) => {
  const [imgUrl, setImgUrl] = useState('/img/img-placeholder.svg');

  useEffect(() => {
    const image = new Image();
    const url = '' + tip.imgUrl;
    if (url) {
      image.addEventListener('load', () => {
        setImgUrl(url);
      });
      image.src = url;
    }
  }, [tip.imgUrl]);

  return (
    <li className={styles.TipItem}>
      <article>
        <figure className={styles.ImageContainer}>
          <img alt="" src={imgUrl} className={styles.Img} />
        </figure>
        <Heading el="h4">{tip.title}</Heading>
        <p>{tip.description}</p>
        <Linkd
          title={`Meer informatie over de tip: ${tip.title}`}
          href={tip.link.to}
          external={true}
        >
          {tip.link.title}
        </Linkd>
      </article>
    </li>
  );
};

export interface MyTipsProps {
  items: MyTip[];
  isOptIn: boolean;
  className?: string;
  isLoading: boolean;
  showHeader?: boolean;
  showOptIn?: boolean;
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
  className,
  isLoading = true,
  showHeader = true,
  isOptIn,
  showOptIn = false,
  ...otherProps
}: MyTipsProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  return (
    <div {...otherProps} className={classnames(styles.MyTips, className)}>
      {showHeader && (
        <div className={styles.HeaderBar}>
          <Heading size="large">Mijn tips</Heading>
          {!!items.length && <Linkd href={AppRoutes.MY_TIPS}>Mijn tips</Linkd>}
          {showOptIn && (
            <Button
              lean={true}
              variant="plain"
              onClick={() => setModalIsOpen(true)}
              className={styles.OptIn}
              icon={ChevronIcon}
            >
              {isOptIn
                ? 'Toon geen persoonlijke tips'
                : 'Toon persoonlijke tips'}
            </Button>
          )}
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
      {showOptIn && (
        <MyTipsOptInOutModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
        />
      )}
    </div>
  );
}
