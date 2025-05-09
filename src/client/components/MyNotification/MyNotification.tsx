import { useState } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';

import styles from './MyNotification.module.scss';
import { MIJN_AMSTERDAM } from '../../../universal/config/app';
import { defaultDateFormat } from '../../../universal/helpers/date';
import type { MyNotification } from '../../../universal/types/App.types';
import { trackEvent } from '../../helpers/monitoring';
import { isInteralUrl } from '../../helpers/utils';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { DocumentLink } from '../DocumentList/DocumentLink';
import InnerHtml from '../InnerHtml/InnerHtml';
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

  const hasTipReason = notification.isTip && notification.tipReason;

  return (
    <article>
      <header className={!isCollapsed ? 'ams-mb--xs' : ''}>
        {smallVariant ? (
          <MaLink
            aria-expanded={!isCollapsed}
            maVariant="fatNoUnderline"
            className={styles.HeaderLink}
            href={notification.link?.to}
            title={`Bekijk inhoud van de melding ${notification.title}`}
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
            {notification.title}
          </MaLink>
        ) : (
          <Heading level={4}>{notification.title}</Heading>
        )}
        <div className={styles.MetaInfoSecondary}>
          <em className={styles.ThemaIndication}>
            {notification.themaTitle ?? MIJN_AMSTERDAM}
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
            {notification.description.includes('<p') ? (
              <InnerHtml el="span">{notification.description}</InnerHtml>
            ) : (
              notification.description
            )}
          </Paragraph>
          {(!!notification.link || !!notification.customLink) && (
            <>
              <Paragraph className={hasTipReason ? 'ams-mb--xs' : ''}>
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
                {hasTipReason && (
                  <>
                    <br />
                    <MaLink
                      href="/"
                      aria-expanded={isTipReasonShown}
                      onClick={(event) => {
                        event.preventDefault();
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
                    </MaLink>
                  </>
                )}
              </Paragraph>
              {isTipReasonShown && (
                <Paragraph>{notification.tipReason}</Paragraph>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
