import { Heading, MegaMenu } from '@amsterdam/design-system-react';

import styles from './MainMenu.module.scss';
import { ThemaMenuItemTransformed } from '../../config/thema';
import { MenuItem } from '../MainHeader/MainHeader.constants';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

export const AmsMainMenuClassname = 'ma-main-header';
export const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';

type MainMenuProps = {
  menuItems: MenuItem[];
  themas: ThemaMenuItemTransformed[];
  isPhoneScreen: boolean;
};

export function MainMenu({ menuItems, themas, isPhoneScreen }: MainMenuProps) {
  return (
    <MegaMenu className={styles.MainMenu}>
      <nav>
        <Heading level={3}>Thema&apos;s</Heading>
        <MegaMenu.ListCategory>
          {themas.map((thema) => {
            const LinkComponent =
              thema.rel === 'external' ? MaLink : MaRouterLink;
            return (
              <LinkComponent
                key={thema.id}
                href={thema.to}
                maVariant="fatNoUnderline"
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
        <Heading level={3}>Categorieën</Heading>
        <MegaMenu.ListCategory>
          {menuItems.map((item) => (
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
