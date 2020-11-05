import classnames from 'classnames';
import React, { useState } from 'react';
import { isExternalUrl } from '../../../universal/helpers/utils';
import { LinkProps } from '../../../universal/types/index';
import { useDesktopScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import Linkd from '../Button/Button';
import { InnerHtml } from '../index';
import styles from './MainFooter.module.scss';
import { useDataApi } from '../../hooks/api/useDataApi';
import { CMSFooterContent } from '../../../server/services/cms-content';
import {
  apiPristineResult,
  ApiResponse,
  isLoading,
} from '../../../universal/helpers';
import { BFFApiUrls } from '../../config/api';
import { useCMSApi } from '../../hooks/api/useCmsApi';
import { AppState } from '../../AppState';
import LoadingContent from '../LoadingContent/LoadingContent';
import { useSessionValue } from '../../hooks/api/useSessionApi';

interface FooterBlockProps {
  startOpen?: boolean;
  id: string;
  title: string;
  links: LinkProps[];
  description: string | null;
}

function FooterBlock({
  id,
  title,
  links,
  description,
  startOpen = false,
}: FooterBlockProps) {
  const titleRole = useDesktopScreen() ? 'columnheader' : 'button';
  const [isOpen, toggleOpen] = useState(startOpen);
  return (
    <div className={classnames(styles.Panel, isOpen && styles.PanelOpen)}>
      <h3 role={titleRole} onClick={() => toggleOpen(isOpen => !isOpen)}>
        {title}
      </h3>
      {!!description && <InnerHtml>{description}</InnerHtml>}
      {!!links.length && (
        <ul>
          {links.map(link => (
            <li key={link.title}>
              <Linkd external={true} href={link.to}>
                {link.title}
              </Linkd>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MainFooter() {
  const atom = useAppStateGetter();
  const { CMS_CONTENT } = atom;
  const footer: CMSFooterContent | null = CMS_CONTENT.content?.footer || null;
  const { isAuthenticated } = useSessionValue();
  const { isLoading } = useCMSApi(isAuthenticated);
  return (
    <footer className={styles.MainFooter} id="MainFooter">
      <div className={classnames(styles.TopBar, styles.InnerContainer)}>
        {isLoading && <div className={styles.FooterLoader}>...</div>}
        {footer?.blocks.map(footerItem => {
          return <FooterBlock key={footerItem.id} {...footerItem} />;
        })}
      </div>
      <div className={styles.BottomBar}>
        <div className={styles.InnerContainer}>
          {footer?.sub.map(link => {
            return (
              <Linkd
                key={link.title}
                href={link.to}
                external={isExternalUrl(link.to)}
              >
                {link.title}
              </Linkd>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
