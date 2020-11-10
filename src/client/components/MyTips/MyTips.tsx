import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { isExternalUrl } from '../../../universal/helpers';
import { MyTip } from '../../../universal/types';
import { IconChevronRight, IconClose, IconInfo } from '../../assets/icons';
import {
  trackItemClick,
  trackItemPresentation,
  trackLink,
  useSessionCallbackOnceDebounced,
} from '../../hooks/analytics.hook';
import { useOptIn } from '../../hooks/useOptIn';
import Linkd, { Button, IconButton } from '../Button/Button';
import Heading from '../Heading/Heading';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent';
import styles from './MyTips.module.scss';
import MyTipsOptInOutModal from './MyTipsOptInOutModal';

export interface TipProps {
  tip: MyTip;
}

function tipTitle(title: string) {
  return `Tip: ${title}`;
}

const Tip = ({ tip }: TipProps) => {
  const [imgUrl, setImgUrl] = useState(
    'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
  );

  useEffect(() => {
    const image = new Image();
    const url = tip.imgUrl;
    if (url) {
      image.addEventListener('load', () => {
        setImgUrl(url);
      });
      image.src = url;
    }
  }, [tip.imgUrl]);

  const isExternal = isExternalUrl(tip.link.to);
  const tipTrackingCategory = tip.isPersonalized
    ? (category: string) => `${category} enkelvoudige content tips`
    : (category: string) => `${category} generieke tips`;

  const presentationCategory = tipTrackingCategory('Tonen');
  const clickCategory = tipTrackingCategory('Klikken');

  useSessionCallbackOnceDebounced(presentationCategory, () =>
    trackItemPresentation(presentationCategory, tipTitle(tip.title))
  );

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <li className={styles.TipItem}>
      <article>
        <figure className={styles.ImageContainer}>
          <img alt="" src={imgUrl} className={styles.Img} />
          {FeatureToggle.tipsFlipActive && !!tip.reason?.length && (
            <>
              {isFlipped && (
                <div className={styles.TipFlip}>
                  {tip.reason.map(reason => (
                    <span key={reason}>{reason}</span>
                  ))}
                </div>
              )}
              <IconButton
                className={styles.TipFlipButton}
                icon={isFlipped ? IconClose : IconInfo}
                title={
                  !isFlipped
                    ? 'Waarom u deze tip ziet.'
                    : 'Sluit tip informatie'
                }
                onClick={() => setIsFlipped(!isFlipped)}
                iconFill="#ffffff"
              />
            </>
          )}
        </figure>
        <Heading el="h4">{tip.title}</Heading>
        <p>{tip.description}</p>
        <Linkd
          title={`Meer informatie over de tip: ${tip.title}`}
          href={tip.link.to}
          external={isExternal}
          onClick={() => {
            trackItemClick(clickCategory, tipTitle(tip.title));
            if (isExternal) {
              trackLink(tip.link.to);
            }
          }}
        >
          {tip.link.title}
        </Linkd>
      </article>
    </li>
  );
};

export interface MyTipsProps {
  items: MyTip[];
  isOptIn?: boolean;
  className?: string;
  isLoading: boolean;
  showHeader?: boolean;
  showOptIn?: boolean;
}

function LoadingContentListItems() {
  const elements = [];
  const barConfig: BarConfig = [
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

interface TipsOptInHeaderProps {
  showTipsPageLink: boolean;
}

function TipsOptInHeader({ showTipsPageLink }: TipsOptInHeaderProps) {
  const { isOptIn } = useOptIn();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  return (
    <>
      <div className={styles.HeaderBar}>
        <Heading size="large">Mijn tips</Heading>
        <Button
          lean={true}
          variant="plain"
          onClick={() => setModalIsOpen(true)}
          className={styles.OptIn}
          icon={IconChevronRight}
          aria-expanded={modalIsOpen}
        >
          {isOptIn ? 'Toon alle tips' : 'Maak tips persoonlijk'}
        </Button>
        {showTipsPageLink && <Linkd href={AppRoutes.TIPS}>Al mijn tips</Linkd>}
      </div>
      <MyTipsOptInOutModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />
    </>
  );
}

function MyTipsNoContentMessage() {
  const { isOptIn } = useOptIn();
  return (
    <p className={styles.NoContentMessage}>
      {isOptIn
        ? 'We hebben op dit moment geen persoonlijke tips voor u.'
        : 'We hebben op dit moment geen tips voor u.'}
    </p>
  );
}

export default function MyTips({
  items = [],
  className,
  isLoading = true,
  showHeader = true,
  ...otherProps
}: MyTipsProps) {
  return (
    <div {...otherProps} className={classnames(styles.MyTips, className)}>
      {showHeader && <TipsOptInHeader showTipsPageLink={!!items.length} />}
      <ul
        className={classnames(
          styles.TipsList,
          isLoading && styles.TipsListLoading
        )}
      >
        {isLoading && <LoadingContentListItems />}
        {!isLoading &&
          items.map((item, i) => <Tip key={item.title} tip={item} />)}
        {!isLoading && items.length % 2 !== 0 && (
          <li className={styles.TipItem} />
        )}
      </ul>
      {!isLoading && !items.length && <MyTipsNoContentMessage />}
    </div>
  );
}
