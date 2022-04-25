import { useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { useDebouncedCallback } from 'use-debounce';
import { ChapterTitles } from '../../../universal/config';
import { defaultDateFormat, isInteralUrl } from '../../../universal/helpers';
import {
  MyNotification as MyNotificationBase,
  SVGComponent,
} from '../../../universal/types';
import { Colors } from '../../config/app';
import {
  trackItemClick,
  useContentDimensions,
  useProfileTypeValue,
} from '../../hooks';
import ChapterIcon from '../ChapterIcon/ChapterIcon';
import Heading from '../Heading/Heading';
import { DocumentLink } from '../DocumentList/DocumentList';
import Linkd from '../Button/Button';
import { InnerHtml } from '..';
import { IconChevronRight } from '../../assets/icons';
import styles from './MyNotifications.module.scss';

export interface MyNotification extends MyNotificationBase {
  Icon?: SVGComponent;
}

const Notification = ({
  notification,
  trackCategory,
  smallVariant,
}: {
  notification: MyNotification;
  trackCategory: string;
  smallVariant: boolean;
}) => {
  const [isReadyForAnimation, setReadyForAnimation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, toggleCollapsed] = useState(!smallVariant);
  const history = useHistory();
  const profileType = useProfileTypeValue();
  const contentDimensions = useContentDimensions(contentRef);

  const setReadyForAnimatonDebounced = useDebouncedCallback(() => {
    if (contentDimensions.height > 0 && contentDimensions.width > 0) {
      setReadyForAnimation(true);
    }
  }, 50);

  setReadyForAnimatonDebounced();

  const heightAnim = {
    immediate: !isReadyForAnimation,
    reverse: !isCollapsed,
    from: {
      height: smallVariant ? 0 : contentDimensions.height,
    },
    to: {
      height: contentDimensions.height,
    },
  };

  const heightAnimSpring = useSpring(heightAnim);

  function showNotification(id: string, to: string) {
    history.push(to);
  }

  const isLinkExternal =
    (!!notification.link?.to && !isInteralUrl(notification.link.to)) ||
    !!notification.link?.download;

  return (
    <>
      <aside className={styles.MetaInfo}>
        <button
          aria-expanded={isCollapsed}
          className={styles.TitleToggle}
          disabled={!smallVariant}
          onClick={() => toggleCollapsed(!isCollapsed)}
        >
          <Heading
            className={classNames(styles.Title, styles.NotificationHeader)}
            el="h4"
            size="small"
          >
            {notification.title}
          </Heading>
          {!notification.Icon ? (
            <ChapterIcon
              fill={Colors.primaryRed}
              className={styles.Icon}
              chapter={notification.isAlert ? 'ALERT' : notification.chapter}
            />
          ) : (
            <notification.Icon className={styles.Icon} />
          )}
          <div className={styles.MetaInfoSecondary}>
            <em className={styles.ChapterIndication}>
              {ChapterTitles[notification.chapter]}
            </em>
            {!notification.hideDatePublished && (
              <time
                className={styles.Datum}
                dateTime={notification.datePublished}
              >
                {defaultDateFormat(notification.datePublished)}
              </time>
            )}
          </div>
          {smallVariant && (
            <IconChevronRight aria-hidden="true" className={styles.CaretIcon} />
          )}
        </button>
      </aside>
      <animated.div
        aria-hidden={!isCollapsed}
        className={styles.Body}
        style={heightAnimSpring}
      >
        <div ref={contentRef}>
          {!!notification.description && (
            <InnerHtml className={styles.Description}>
              {notification.description}
            </InnerHtml>
          )}
          {!!notification.moreInformation && (
            <InnerHtml className={styles.MoreInformation}>
              {notification.moreInformation}
            </InnerHtml>
          )}
          {(!!notification.link || !!notification.customLink) && (
            <p className={styles.Action}>
              {notification.link?.download ? (
                <DocumentLink
                  document={{
                    id: notification.id,
                    title: notification.title,
                    datePublished: notification.datePublished,
                    url: notification.link.to,
                    download: notification.link.download,
                  }}
                  label={notification.link.title}
                />
              ) : (
                <Linkd
                  title={`Meer informatie over de melding: ${notification.title}`}
                  href={notification.customLink ? '#' : notification.link?.to}
                  external={isLinkExternal}
                  onClick={() => {
                    trackItemClick(
                      trackCategory,
                      notification.title,
                      profileType
                    );
                    if (notification.customLink?.callback) {
                      notification.customLink.callback();
                      return false;
                    }
                    if (notification.link && !isLinkExternal) {
                      showNotification(notification.id, notification.link.to);
                      return false;
                    }
                  }}
                >
                  {(notification.link || notification.customLink)?.title ||
                    'Meer informatie over ' + notification.title}
                </Linkd>
              )}
            </p>
          )}
        </div>
      </animated.div>
    </>
  );
};

export default Notification;
