import { Icon, UnorderedList } from '@amsterdam/design-system-react';

import styles from './MyThemasPanel.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaMenuItemTransformed } from '../../config/thema';
import { ThemaIcons } from '../../config/themaIcons';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MaRouterLink } from '../MaLink/MaLink';

type ThemaLinkLoaderProps = {
  width: number;
};

function ThemaLinkLoader({ width }: ThemaLinkLoaderProps) {
  const ICON_SIZE = '2rem';
  const MARGIN_BOTTOM = '0';
  const LINK_HEIGHT = '1.6rem';
  return (
    <LoadingContent
      className={styles.LoadingPlaceholder}
      barConfig={[
        [ICON_SIZE, ICON_SIZE, MARGIN_BOTTOM],
        [`${width}rem`, LINK_HEIGHT, MARGIN_BOTTOM],
      ]}
    />
  );
}

export interface MyThemasPanelProps {
  items: ThemaMenuItemTransformed[];
  isLoading: boolean;
  trackCategory: string;
}

export function MyThemasPanel({
  items = [],
  isLoading = true,
}: MyThemasPanelProps) {
  return (
    <>
      <UnorderedList markers={false} className="ams-mb--sm">
        {items.map(({ id, to, title, rel }) => {
          const ThemaIcon = ThemaIcons[id];
          return (
            <UnorderedList.Item key={id}>
              <MaRouterLink maVariant="fatNoUnderline" href={to}>
                <span className={styles.ThemaLink}>
                  <Icon svg={ThemaIcon} size="level-4" square /> {title}
                </span>
              </MaRouterLink>
            </UnorderedList.Item>
          );
        })}
        {isLoading && (
          <>
            <ThemaLinkLoader width={20} />
            <ThemaLinkLoader width={15} />
            <ThemaLinkLoader width={18} />
          </>
        )}
      </UnorderedList>
      <MaRouterLink href={AppRoutes.GENERAL_INFO}>
        Dit ziet u in Mijn Amsterdam
      </MaRouterLink>
    </>
  );
}
