import { Heading, MegaMenu } from '@amsterdam/design-system-react';

import styles from './MegaMenu.module.scss';
import { ThemaMenuItem } from '../../config/thema';
import { MenuItem } from '../MainHeader/MainHeader.constants';
import { SecondaryLinks } from '../MainHeader/SecondaryLinks';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

type Props = {
  menuItems: MenuItem[];
  themas: ThemaMenuItem[];
  isPhoneScreen: boolean;
};

export default function Menu({ menuItems, themas, isPhoneScreen }: Props) {
  return (
    <MegaMenu>
      <div className={styles.menu}>
        <nav>
          <Heading level={3} size="level-3">
            Thema’s
          </Heading>
          <MegaMenu.ListCategory>
            {themas.map((thema, index) => {
              return thema.rel === 'external' ? (
                <MaLink
                  key={thema.id}
                  href={thema.to}
                  maVariant="noDefaultUnderline"
                  rel="noreferrer"
                  className={styles.menuItem}
                >
                  {thema.title}
                </MaLink>
              ) : (
                <MaRouterLink
                  key={thema.id}
                  href={thema.to}
                  maVariant="noDefaultUnderline"
                  className={styles.menuItem}
                >
                  {thema.title}
                </MaRouterLink>
              );
            })}
          </MegaMenu.ListCategory>
        </nav>
        <nav>
          <Heading level={3} size="level-3">
            Categorieën
          </Heading>
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
        {isPhoneScreen && (
          <nav>
            <SecondaryLinks showIcons />
          </nav>
        )}
      </div>
    </MegaMenu>
  );
}
