import { useRef, useState } from 'react';

import { Heading } from '@amsterdam/design-system-react';
import { animated, useSpring } from '@react-spring/web';
import { useDebouncedCallback } from 'use-debounce';

import { InnerHtml } from '..';
import styles from './MyNotifications.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  MyNotification as MyNotificationBase,
  SVGComponent,
} from '../../../universal/types';
import { IconChevronRight, IconInfo } from '../../assets/icons';
import { Colors } from '../../config/app';
import { ThemaTitles } from '../../config/thema';
import { trackItemClick } from '../../hooks/analytics.hook';
import { useContentDimensions } from '../../hooks/useContentDimensions';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { trackEvent } from '../../helpers/monitoring';
import { isInteralUrl } from '../../helpers/utils';
import Linkd from '../Button/Button';
import { DocumentLink } from '../DocumentList/DocumentLink';
import ThemaIcon from '../ThemaIcon/ThemaIcon';

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
  const profileType = useProfileTypeValue();
  const contentDimensions = useContentDimensions(contentRef);
  const [isTipReasonShown, showTipReason] = useState(false);

  const DEBOUNCE_MS = 50;
  const setReadyForAnimatonDebounced = useDebouncedCallback(() => {
    if (contentDimensions.height > 0 && contentDimensions.width > 0) {
      setReadyForAnimation(true);
    }
  });

  setReadyForAnimatonDebounced();

  const heightAnim = {
    immediate: !isReadyForAnimation,
    reverse: !isCollapsed,
    from: {
      height: 0,
    },
    to: {
      height: contentDimensions.height,
    },
  };

  const heightAnimSpring = useSpring(heightAnim);

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
          onClick={() => {
            if (smallVariant) {
              trackEvent('klik-op-tip-titel', {
                title: `${trackCategory} - ${notification.title}`,
                profileType,
              });
              toggleCollapsed(!isCollapsed);
            }
          }}
        >
          <Heading className={styles.NotificationHeader} level={4}>
            {notification.title}
          </Heading>
          {!notification.Icon ? (
            <ThemaIcon
              fill={Colors.primaryRed}
              className={styles.Icon}
              thema={notification.isAlert ? 'ALERT' : notification.thema}
            />
          ) : (
            <notification.Icon className={styles.Icon} />
          )}
          <div className={styles.MetaInfoSecondary}>
            <em className={styles.ThemaIndication}>
              {ThemaTitles[notification.thema]}
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
        style={smallVariant ? heightAnimSpring : { height: 'auto' }}
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
            <>
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
                        notification.link?.to || '#',
                        `${trackCategory} - ${notification.title}`,
                        profileType
                      );

                      trackEvent('klik-op-tip-link', {
                        title: `${trackCategory} - ${notification.title}`,
                        url: notification.link?.to || '#',
                        profileType,
                      });

                      if (notification.customLink?.callback) {
                        notification.customLink.callback();
                        return false;
                      }
                    }}
                  >
                    {(notification.link || notification.customLink)?.title ||
                      'Meer informatie over ' + notification.title}
                  </Linkd>
                )}
              </p>
              {notification.isTip && notification.tipReason && (
                <p className={styles.TipReason}>
                  <IconInfo />
                  <a
                    onClick={() => {
                      if (!isTipReasonShown) {
                        trackEvent('klik-op-tip-reden', {
                          title: `${trackCategory} - ${notification.title}`,
                        });
                      }
                      return showTipReason(
                        (isTipReasonShown) => !isTipReasonShown
                      );
                    }}
                  >
                    Waarom zie ik deze tip?
                  </a>
                  {isTipReasonShown && <span>{notification.tipReason}</span>}
                </p>
              )}
            </>
          )}
        </div>
      </animated.div>
    </>
  );
};

export default Notification;
