import { Heading, MegaMenu } from '@amsterdam/design-system-react';

import { categoryMenuItems } from './MainMenu.constants';
import styles from './MainMenu.module.scss';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';
import { MainHeaderSecondaryLinks } from '../MainHeader/MainHeader';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

export const MAIN_MENU_ID = 'main-menu';

export function MainMenu() {
  const { items } = useThemaMenuItems();
  const isPhoneScreen = usePhoneScreen();

  return (
    <>
      <MegaMenu id={MAIN_MENU_ID} className={styles.MainMenu}>
        <nav className={styles.NavSection}>
          <Heading level={3} size="level-4">
            Thema&apos;s
          </Heading>
          <MegaMenu.ListCategory>
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
                  className={styles.MenuItem}
                >
                  {thema.title}
                </LinkComponent>
              );
            })}
          </MegaMenu.ListCategory>
        </nav>
        <nav className={styles.NavSection}>
          <Heading level={3} size="level-4">
            Categorieën
          </Heading>
          <MegaMenu.ListCategory>
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
          </MegaMenu.ListCategory>
        </nav>
        {isPhoneScreen && (
          <nav>
            <MegaMenu.ListCategory>
              <MainHeaderSecondaryLinks
                wrapInListElement={false}
                linkClassName={styles.MenuItem}
              />
            </MegaMenu.ListCategory>
          </nav>
        )}
      </MegaMenu>
    </>
  );
}
