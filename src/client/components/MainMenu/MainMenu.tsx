import { Heading } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { categoryMenuItems } from './MainMenu.constants.ts';
import styles from './MainMenu.module.scss';
import { getRedactedClass } from '../../helpers/cobrowse.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { useActiveThemaMenuItems } from '../../hooks/useThemaMenuItems.ts';
import { MainHeaderSecondaryLinks } from '../MainHeader/MainHeader.tsx';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';

export const MAIN_MENU_ID = 'main-menu';

export function MainMenu() {
  const { items } = useActiveThemaMenuItems();
  const isPhoneScreen = useSmallScreen();

  return (
    <div id={MAIN_MENU_ID} className={styles.MainMenu}>
      <nav className={styles.NavSection}>
        <Heading level={2}>Thema&apos;s</Heading>
        <div>
          {items.map((thema) => {
            const LinkComponent = thema.to.startsWith('http')
              ? MaLink
              : MaRouterLink;
            return (
              <LinkComponent
                key={thema.id}
                href={thema.to}
                maVariant="fatNoDefaultUnderline"
                rel={thema.to.startsWith('http') ? 'noreferrer' : undefined}
                className={classNames(
                  styles.MenuItem,
                  getRedactedClass(thema.id)
                )}
              >
                {thema.title}
              </LinkComponent>
            );
          })}
        </div>
      </nav>
      <nav className={styles.NavSection}>
        <Heading level={2}>Categorieën</Heading>
        <div>
          {categoryMenuItems.map((item) => (
            <MaRouterLink
              key={item.id}
              href={item.to}
              maVariant="noDefaultUnderline"
              className={styles.MenuItem}
            >
              {item.title}
            </MaRouterLink>
          ))}
        </div>
      </nav>
      {isPhoneScreen && (
        <nav>
          <div>
            <MainHeaderSecondaryLinks
              wrapInListElement={false}
              linkClassName={styles.MenuItem}
            />
          </div>
        </nav>
      )}
    </div>
  );
}
