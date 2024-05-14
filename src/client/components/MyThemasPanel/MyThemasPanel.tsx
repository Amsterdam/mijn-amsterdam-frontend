import { AppRoutes, ChapterMenuItem } from '../../../universal/config';
import { ThemaIcons } from '../../config/themaIcons';
import { Heading } from '@amsterdam/design-system-react';
import { IconInfo } from '../../assets/icons';
import Linkd from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MainNavSubmenuLink } from '../MainNavSubmenu/MainNavSubmenu';
import Panel from '../Panel/Panel';
import styles from './MyThemasPanel.module.scss';

export interface MyThemasPanelProps {
  title: string;
  items: ChapterMenuItem[];
  isLoading: boolean;
  trackCategory: string;
  className?: string;
}

export default function MyThemasPanel({
  title,
  items = [],
  isLoading = true,
}: MyThemasPanelProps) {
  return (
    <Panel className={styles.MyThemasPanel}>
      <div className={styles.Header}>
        <Heading size="level-1" level={3} className={styles.Title}>
          {title}
        </Heading>
        <Linkd
          className={styles.GeneralInfoLink}
          href={AppRoutes.GENERAL_INFO}
          variant="plain"
          icon={IconInfo}
          lean={true}
          aria-label="Dit ziet u in Mijn Amsterdam"
        />
      </div>
      <div className={styles.Links}>
        {items.map(({ id, to, title, rel }) => {
          return (
            <MainNavSubmenuLink
              data-thema-id={id}
              key={id}
              to={to}
              rel={rel}
              title={title}
              Icon={ThemaIcons[id]}
            />
          );
        })}
      </div>
      {isLoading && (
        <LoadingContent
          className={styles.LoadingPlaceholder}
          barConfig={[
            ['3.4rem', '3.4rem', '0'],
            ['auto', '1.6rem', '0'],
            ['3.4rem', '3.4rem', '0'],
            ['auto', '1.6rem', '0'],
          ]}
        />
      )}
    </Panel>
  );
}
