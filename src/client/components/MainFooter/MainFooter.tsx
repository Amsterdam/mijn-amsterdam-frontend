import classnames from 'classnames';
import React, { useContext, useState } from 'react';
import { AppRoutes } from '../../../universal/config';
import { LinkProps } from '../../../universal/types/index';
import { AppContext } from '../../AppState';
import { useDesktopScreen } from '../../hooks/media.hook';
import Linkd from '../Button/Button';
import { InnerHtml } from '../index';
import styles from './MainFooter.module.scss';

interface PanelState {
  [panelId: string]: boolean;
}

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
  const { CMS_CONTENT } = useContext(AppContext);
  const footerItems = CMS_CONTENT.content?.footer || [];

  return (
    <footer className={styles.MainFooter} id="MainFooter">
      <div className={classnames(styles.TopBar, styles.InnerContainer)}>
        {footerItems.map(footerItem => {
          return <FooterBlock key={footerItem.id} {...footerItem} />;
        })}
      </div>
      <div className={styles.BottomBar}>
        <div className={styles.InnerContainer}>
          <Linkd href={AppRoutes.PROCLAIMER}>Proclaimer</Linkd>
        </div>
      </div>
    </footer>
  );
}
