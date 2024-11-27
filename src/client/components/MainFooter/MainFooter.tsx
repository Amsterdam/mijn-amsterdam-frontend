import {
  Footer,
  Grid,
  Heading,
  LinkList,
  PageMenu,
} from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './MainFooter.module.scss';
import type {
  CMSFooterContent,
  FooterBlock as FooterBlockProps,
} from '../../../server/services';
import { transformAstToReact } from '../../helpers/ast-to-react';
import { useCMSApi } from '../../hooks/api/useCmsApi';
import { useAppStateGetter } from '../../hooks/useAppState';

function FooterBlock({ id, title, links, description }: FooterBlockProps) {
  return (
    <Grid.Cell key={title} span={4} className="page-footer-space-y">
      <Heading inverseColor level={4} className="ams-mb--xs">
        {title}
      </Heading>
      {!!description && transformAstToReact(id, description, true)}
      {!!links.length && (
        <LinkList>
          {links.map((link) => (
            <LinkList.Link key={link.to} inverseColor href={link.to}>
              {link.title}
            </LinkList.Link>
          ))}
        </LinkList>
      )}
    </Grid.Cell>
  );
}
export default function MainFooter({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const appState = useAppStateGetter();
  const { CMS_CONTENT } = appState;
  const footer: CMSFooterContent | null = CMS_CONTENT.content?.footer || null;

  // Calls CMS service for non-authenticated users, doesn't call the service for authenticated users, footer data will come from the services/stream endpoint in this case.
  useCMSApi(isAuthenticated);

  return (
    <Footer>
      <Footer.Top className={classnames('page-footer-top', styles.FooterTop)}>
        <Grid gapVertical="large" paddingVertical="medium">
          {footer?.blocks.map((footerItem) => (
            <FooterBlock key={footerItem.id} {...footerItem} />
          ))}
        </Grid>
      </Footer.Top>
      <Footer.Bottom className={styles.BottomBar}>
        <Grid paddingVertical="small">
          <Grid.Cell span="all">
            <PageMenu>
              {footer?.sub.map((link) => {
                return (
                  <PageMenu.Link key={link.title} href={link.to}>
                    {link.title}
                  </PageMenu.Link>
                );
              })}
            </PageMenu>
          </Grid.Cell>
        </Grid>
      </Footer.Bottom>
    </Footer>
  );
}
