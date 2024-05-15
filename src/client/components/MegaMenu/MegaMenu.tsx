import { Heading, LinkList, MegaMenu } from '@amsterdam/design-system-react';
import { ThemaMenuItem } from '../../../universal/config';
import styles from './MegaMenu.module.scss';
import { MenuItem } from '../MainHeader/MainHeader.constants';
import { MaRouterLink } from '../MaLink/MaLink';

type Props = {
  menuItems: MenuItem[];
  themas: ThemaMenuItem[];
};

export default function Menu({ menuItems, themas }: Props) {
  return (
    <MegaMenu>
      <div className={styles.menu}>
        <div>
          <Heading level={3} size="level-3">
            Thema’s
          </Heading>
          <MegaMenu.ListCategory>
            <LinkList>
              {themas.map((thema) => (
                <MaRouterLink
                  key={thema.id}
                  href={thema.to}
                  maVariant="noDefaultUnderline"
                >
                  {thema.title}
                </MaRouterLink>
              ))}
            </LinkList>
          </MegaMenu.ListCategory>
        </div>
        <div>
          <Heading level={3} size="level-3">
            Categorieën
          </Heading>
          <MegaMenu.ListCategory>
            <LinkList>
              {menuItems.map((item) => (
                <MaRouterLink
                  key={item.id}
                  href={item.to}
                  maVariant="noDefaultUnderline"
                >
                  {item.title}
                </MaRouterLink>
              ))}
            </LinkList>
          </MegaMenu.ListCategory>
        </div>
      </div>
    </MegaMenu>
  );
}
