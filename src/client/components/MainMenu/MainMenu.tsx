import { Heading, MegaMenu } from '@amsterdam/design-system-react';

import { categoryMenuItems } from './MainMenu.constants';
import styles from './MainMenu.module.scss';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

export const AmsMainMenuClassname = 'ma-main-header';
export const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';

export function MainMenu() {
  const { items } = useThemaMenuItems();
  return (
    <MegaMenu className={styles.MainMenu}>
      <nav>
        <Heading level={3} size="level-4">
          Thema&apos;s
        </Heading>
        <MegaMenu.ListCategory>
          {items.map((thema) => {
            const LinkComponent =
              thema.rel === 'external' ? MaLink : MaRouterLink;
            return (
              <LinkComponent
                key={thema.id}
                href={thema.to}
                maVariant="fatNoDefaultUnderline"
                rel={thema.rel === 'external' ? 'noreferrer' : undefined}
                className={styles.menuItem}
              >
                {thema.title}
              </LinkComponent>
            );
          })}
        </MegaMenu.ListCategory>
      </nav>
      <nav>
        <Heading level={3} size="level-4">
          Categorieën
        </Heading>
        <MegaMenu.ListCategory>
          {categoryMenuItems.map((item) => (
            <MaRouterLink
              key={item.id}
              href={item.to}
              maVariant="noDefaultUnderline"
              className={styles.menuItem}
            >
              {item.title}
            </MaRouterLink>
          ))}
        </MegaMenu.ListCategory>
      </nav>
    </MegaMenu>
  );
}
