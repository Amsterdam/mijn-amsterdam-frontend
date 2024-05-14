import { Heading, LinkList, MegaMenu } from '@amsterdam/design-system-react';
import { ChapterMenuItem } from '../../../universal/config';
import styles from './MegaMenu.module.scss';
import { MenuItem } from '../MainHeader/MainHeader.constants';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

type Props = {
  menuItems: MenuItem[];
  chapters: ChapterMenuItem[];
};

export default function Menu({ menuItems, chapters }: Props) {
  return (
    <MegaMenu>
      <div className={styles.menu}>
        <div>
          <Heading level={3} size="level-3">
            Thema’s
          </Heading>
          <MegaMenu.ListCategory>
            <LinkList>
              {chapters.map((chapter) => (
                <MaLink
                  key={chapter.id}
                  href={chapter.to}
                  maVariant="noDefaultUnderline"
                >
                  {chapter.title}
                </MaLink>
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
