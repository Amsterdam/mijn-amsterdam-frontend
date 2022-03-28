import { useEffect, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { ChapterTitles } from '../../../universal/config';
import { defaultDateFormat, isInteralUrl } from '../../../universal/helpers';
import {
  MyNotification as MyNotificationBase,
  SVGComponent,
} from '../../../universal/types';
import { Colors } from '../../config/app';
import {
  trackItemClick,
  useComponentSize,
  usePhoneScreen,
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
}: {
  notification: MyNotification;
  trackCategory: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const smallLayout = usePhoneScreen();
  const [isCollapsed, toggleCollapsed] = useState(smallLayout ? false : true);
  const history = useHistory();
  const profileType = useProfileTypeValue();

  const size = useComponentSize(contentRef.current);

  const [{ height: contentHeight }, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  const contentDimensions = useMemo(() => {
    return {
      width: size.width,
      height: size.height,
    };
  }, [size.height, size.width]);

  useEffect(() => {
    if (contentRef && contentRef.current) {
      setDimensions(contentDimensions);
    }
  }, [contentDimensions]);

  const heightAnim = {
    immediate: false,
    reverse: !isCollapsed,
    from: {
      height: smallLayout ? 0 : contentHeight,
    },
    to: {
      height: contentHeight,
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
      <Heading
        className={classNames(styles.Title, styles.NotificationHeader)}
        el="h4"
        size="small"
      >
        {notification.title}
      </Heading>
      <aside className={styles.MetaInfo}>
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
          <button
            aria-expanded={isCollapsed}
            className={styles.TitleToggle}
            disabled={!smallLayout}
            onClick={() => (smallLayout ? toggleCollapsed(!isCollapsed) : null)}
          >
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
            {smallLayout && (
              <IconChevronRight
                aria-hidden="true"
                className={styles.CaretIcon}
                width={16}
                height={16}
              />
            )}
          </button>
        </div>
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
