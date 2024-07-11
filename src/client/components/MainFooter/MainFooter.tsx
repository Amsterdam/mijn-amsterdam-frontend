import classnames from 'classnames';
import { useState } from 'react';
import type {
  AstNode,
  CMSFooterContent,
} from '../../../server/services/cms-content';
import { LinkProps } from '../../../universal/types';
import { useCMSApi } from '../../hooks/api/useCmsApi';
import { useDesktopScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import Linkd from '../Button/Button';
import InnerHtml from '../InnerHtml/InnerHtml';
import styles from './MainFooter.module.scss';
import { isExternalUrl } from '../../utils/utils';

interface FooterBlockProps {
  startOpen?: boolean;
  id: string;
  title: string;
  links: LinkProps[];
  description: string | null | AstNode[];
}

function FooterBlock({
  id,
  title,
  links,
  description,
  startOpen = false,
}: FooterBlockProps) {
  const containerRole = useDesktopScreen() ? 'row' : undefined;
  const titleRole = useDesktopScreen() ? 'columnheader' : 'button';
  const [isOpen, toggleOpen] = useState(startOpen);
  return (
    <div
      className={classnames(styles.Panel, isOpen && styles.PanelOpen)}
      role={containerRole}
    >
      <h3 role={titleRole} onClick={() => toggleOpen((isOpen) => !isOpen)}>
        {title}
      </h3>
      {!!description && !Array.isArray(description) && (
        <InnerHtml>{description}</InnerHtml>
      )}
      {!!links.length && (
        <ul>
          {links.map((link) => (
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

interface MainFooterProps {
  isAuthenticated: boolean;
}

export default function MainFooter({
  isAuthenticated = false,
}: MainFooterProps) {
  const atom = useAppStateGetter();
  const { CMS_CONTENT } = atom;
  const footer: CMSFooterContent | null = CMS_CONTENT.content?.footer || null;
  const { isLoading } = useCMSApi(isAuthenticated);

  return (
    <footer className={styles.MainFooter} id="skip-to-id-MainFooter">
      <div className={classnames(styles.TopBar, styles.InnerContainer)}>
        {isLoading && <div className={styles.FooterLoader}>...</div>}
        {footer?.blocks.map((footerItem) => {
          return <FooterBlock key={footerItem.id} {...footerItem} />;
        })}
      </div>
      <div className={styles.BottomBar}>
        <div className={styles.InnerContainer}>
          {footer?.sub.map((link) => {
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
