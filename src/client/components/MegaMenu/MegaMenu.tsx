import { Heading, LinkList, MegaMenu } from '@amsterdam/design-system-react';
import { ChapterMenuItem } from '../../../universal/config';
import styles from './MegaMenu.module.scss';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';

type Props = {
  menuItems: MenuItem[];
  chapters: ChapterMenuItem[];
};

export default function Menu({ menuItems, chapters }: Props) {
  return (
    <MegaMenu>
      <div className={styles.menu}>
        <Heading level={3} size="level-3">
          Thema’s
        </Heading>

        <Heading level={3} size="level-3">
          Categorieën
        </Heading>

        <MegaMenu.ListCategory>
          <LinkList>
            {chapters.map((chapter) => (
              <LinkList.Link key={chapter.id} href={chapter.to}>
                {chapter.title}
              </LinkList.Link>
            ))}
          </LinkList>
        </MegaMenu.ListCategory>

        <MegaMenu.ListCategory>
          <LinkList>
            {menuItems.map((item) => (
              <LinkList.Link key={item.id} href={item.to} icon={() => null}>
                {item.title}
              </LinkList.Link>
            ))}
          </LinkList>
        </MegaMenu.ListCategory>
      </div>
    </MegaMenu>
  );
}
