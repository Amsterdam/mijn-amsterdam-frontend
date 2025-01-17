import { useState } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';

import styles from './MyNotification.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import type { MyNotification } from '../../../universal/types/App.types';
import { IconInfo } from '../../assets/icons';
import { ThemaTitles } from '../../config/thema';
import { trackEvent } from '../../helpers/monitoring';
import { isInteralUrl } from '../../helpers/utils';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { DocumentLink } from '../DocumentList/DocumentLink';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

type MyNotificationProps = {
  notification: MyNotification;
  trackCategory?: string;
  smallVariant?: true;
};

export function MyNotification({
  notification,
  trackCategory,
  smallVariant,
}: MyNotificationProps) {
  const profileType = useProfileTypeValue();

  const [isCollapsed, toggleCollapsed] = useState(!!smallVariant);
  const [isTipReasonShown, showTipReason] = useState(false);

  const isLinkExternal =
    (!!notification.link?.to && !isInteralUrl(notification.link.to)) ||
    !!notification.link?.download;

  const LinkComponent = isLinkExternal ? MaLink : MaRouterLink;

  return (
    <article>
      <header className={!isCollapsed ? 'ams-mb--xs' : ''}>
        {smallVariant ? (
          <MaLink
            aria-expanded={isCollapsed}
            maVariant="fatNoUnderline"
            className={styles.HeaderLink}
            href={notification.link?.to}
            onClick={(event) => {
              event.preventDefault();
              trackEvent('klik-op-tip-titel', {
                title: `${trackCategory} - ${notification.title}`,
                profileType,
              });
              toggleCollapsed(!isCollapsed);
              return false;
            }}
          >
            {notification.isAlert ? '⚠ ' : ''}
            {notification.title}
          </MaLink>
        ) : (
          <Heading level={4}>{notification.title}</Heading>
        )}
        <div className={styles.MetaInfoSecondary}>
          <em className={styles.ThemaIndication}>
            {ThemaTitles[notification.thema]}
          </em>{' '}
          {!notification.hideDatePublished && (
            <time
              className={styles.Datum}
              dateTime={notification.datePublished}
            >
              {defaultDateFormat(notification.datePublished)}
            </time>
          )}
        </div>
      </header>

      {!isCollapsed && (
        <div className={styles.Body}>
          <Paragraph className="ams-mb--xs">
            {notification.description}
          </Paragraph>
          {(!!notification.link || !!notification.customLink) && (
            <>
              <Paragraph>
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
                  <LinkComponent
                    title={`Meer informatie over de melding: ${notification.title}`}
                    href={notification.customLink ? '#' : notification.link?.to}
                    onClick={() => {
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
                  </LinkComponent>
                )}
              </Paragraph>
              {notification.isTip && notification.tipReason && (
                <Paragraph className={styles.TipReason}>
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
                </Paragraph>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
