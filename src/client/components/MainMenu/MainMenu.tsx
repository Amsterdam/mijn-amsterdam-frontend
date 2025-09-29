import { Heading } from '@amsterdam/design-system-react';

import { categoryMenuItems } from './MainMenu.constants';
import styles from './MainMenu.module.scss';
import { getRedactedClass } from '../../helpers/cobrowse';
import { useSmallScreen } from '../../hooks/media.hook';
import { useMyThemaMenuItems } from '../../hooks/useThemaMenuItems';
import { MainHeaderSecondaryLinks } from '../MainHeader/MainHeader';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

export const MAIN_MENU_ID = 'main-menu';

export function MainMenu() {
  const { items } = useMyThemaMenuItems();
  const isPhoneScreen = useSmallScreen();

  return (
    <div id={MAIN_MENU_ID} className={styles.MainMenu}>
      <nav className={styles.NavSection}>
        <Heading level={3} size="level-4">
          Thema&apos;s
        </Heading>
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
                className={`${styles.MenuItem} ${getRedactedClass(thema.id)}`}
              >
                {thema.title}
              </LinkComponent>
            );
          })}
        </div>
      </nav>
      <nav className={styles.NavSection}>
        <Heading level={3} size="level-4">
          Categorieën
        </Heading>
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
