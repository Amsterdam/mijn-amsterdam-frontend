import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { isExternalUrl } from '../../../universal/helpers';
import { directApiUrlByProfileType } from '../../../universal/helpers/utils';
import { MyTip } from '../../../universal/types';
import { IconChevronRight, IconClose, IconInfo } from '../../assets/icons';
import {
  trackItemClick,
  trackItemPresentation,
  trackLink,
} from '../../hooks/analytics.hook';
import { useOptIn } from '../../hooks/useOptIn';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import Linkd, { Button, IconButton } from '../Button/Button';
import Heading from '../Heading/Heading';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent';
import styles from './MyTips.module.scss';
import MyTipsOptInOutModal from './MyTipsOptInOutModal';

export interface TipProps {
  tip: MyTip;
  profileType: ProfileType;
}

function tipTitle(title: string) {
  return `Tip: ${title}`;
}
function tipFlipTitle(title: string) {
  return `Tip flip: ${title}`;
}

const PLACEHOLDER_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

function tipTrackingCategory(category: string, isPersonalized: boolean) {
  return isPersonalized
    ? `${category} gepersonalizeerde tips`
    : `${category} generieke tips`;
}

const Tip = ({ tip, profileType }: TipProps) => {
  const [imgUrl, setImgUrl] = useState(PLACEHOLDER_URL);

  const tipImgUrl = tip.imgUrl
    ? directApiUrlByProfileType(tip.imgUrl, profileType)
    : false;

  useEffect(() => {
    if (!tipImgUrl) {
      return;
    }
    const image = new Image();
    if (tipImgUrl) {
      image.addEventListener('load', () => {
        setImgUrl(tipImgUrl);
      });
      image.src = tipImgUrl;
    }
  }, [tipImgUrl]);

  const isExternal = isExternalUrl(tip.link.to);

  const clickCategory = tipTrackingCategory('Klikken', tip.isPersonalized);
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <li
      className={classnames(
        styles.TipItem,
        tip.isPersonalized ? 'is-personalized' : ''
      )}
    >
      <article>
        <div className={styles.ImageContainer}>
          <img alt="" src={imgUrl} className={styles.Img} />
          {FeatureToggle.tipsFlipActive && !!tip.reason?.length && (
            <div>
              <IconButton
                id={`tip-flip-${tip.id}`}
                className={styles.TipFlipButton}
                icon={isFlipped ? IconClose : IconInfo}
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  if (!isFlipped) {
                    trackItemClick(
                      clickCategory,
                      tipFlipTitle(tip.title),
                      profileType
                    );
                  }
                }}
                aria-label="Reden waarom u deze tip ziet"
                aria-expanded={isFlipped}
                iconFill="#ffffff"
              />
              <p
                aria-labelledby={`tip-flip-${tip.id}`}
                className={styles.TipFlip}
                hidden={!isFlipped}
              >
                {tip.reason.map(reason => (
                  <span key={reason}>{reason}</span>
                ))}
              </p>
            </div>
          )}
        </div>
        <Heading el="h4">{tip.title}</Heading>
        <p>{tip.description}</p>
        <Linkd
          title={`Meer informatie over de tip: ${tip.title}`}
          href={tip.link.to}
          external={isExternal}
          onClick={() => {
            trackItemClick(clickCategory, tipTitle(tip.title), profileType);
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
  const profileType = useProfileTypeValue();
  useEffect(() => {
    if (items.length) {
      items.forEach(tip => {
        trackItemPresentation(
          tipTrackingCategory('Tonen', tip.isPersonalized),
          tipTitle(tip.title),
          profileType
        );
      });
    }
  }, [items, profileType]);

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
          items.map((item, i) => (
            <Tip key={item.title} profileType={profileType} tip={item} />
          ))}
        {!isLoading && items.length % 2 !== 0 && (
          <li className={styles.TipItem} />
        )}
      </ul>
      {!isLoading && !items.length && <MyTipsNoContentMessage />}
    </div>
  );
}
