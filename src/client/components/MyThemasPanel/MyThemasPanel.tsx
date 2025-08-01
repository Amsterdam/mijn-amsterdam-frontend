import { Icon, UnorderedList } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './MyThemasPanel.module.scss';
import { ThemaMenuItemTransformed } from '../../config/thema-types';
import { getRedactedClass } from '../../helpers/utils';
import { GeneralInfoRoute } from '../../pages/GeneralInfo/GeneralInfo-routes';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

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
}

export function MyThemasPanel({
  items = [],
  isLoading = true,
}: MyThemasPanelProps) {
  return (
    <>
      <UnorderedList
        markers={false}
        className={classNames('ams-mb-m', styles.LinkList)}
      >
        {items.map(({ id, to, title, IconSVG }) => {
          const LinkComponent = to.startsWith('http') ? MaLink : MaRouterLink;
          return (
            <UnorderedList.Item key={id}>
              <LinkComponent maVariant="fatNoUnderline" href={to}>
                <span className={`styles.ThemaLink ${getRedactedClass(id)}`}>
                  {IconSVG && (
                    <Icon
                      svg={IconSVG}
                      size="heading-4"
                      className={styles.ThemaLinkIcon}
                      square
                    />
                  )}
                  {title}
                </span>
              </LinkComponent>
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
      <MaRouterLink href={GeneralInfoRoute.route}>
        Dit ziet u in Mijn Amsterdam
      </MaRouterLink>
    </>
  );
}
