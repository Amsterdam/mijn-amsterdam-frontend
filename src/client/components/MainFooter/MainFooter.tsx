import { Fragment, ReactNode } from 'react';

import {
  Grid,
  Heading,
  Icon,
  Link,
  LinkList,
  PageFooter,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { ChevronRightIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';

import styles from './MainFooter.module.scss';
import type {
  AstNode,
  CMSFooterContent,
  FooterBlock as FooterBlockProps,
} from '../../../server/services/cms/cms-content';
import { useCMSApi } from '../../hooks/api/useCmsApi';
import { useAppStateGetter } from '../../hooks/useAppState';

function FooterBlock({ id, title, links, description }: FooterBlockProps) {
  return (
    <Grid.Cell key={title} span={4}>
      <Heading color="inverse" level={4} className="ams-mb-s">
        {title}
      </Heading>
      {!!description && getEl(id, description)}
      {!!links.length && (
        <LinkList>
          {links.map((link) => (
            <LinkList.Link key={link.to} color="inverse" href={link.to}>
              {link.title}
            </LinkList.Link>
          ))}
        </LinkList>
      )}
    </Grid.Cell>
  );
}
function getEl(baseId: string, astElement: AstNode | AstNode[]): ReactNode {
  if (Array.isArray(astElement)) {
    return astElement.map((el, index) => {
      // Not an ideal key as it uses index, it's hard to find suitable key value in these ast nodes without completely traversing the
      // tree in search for a unique identifier.
      const key = `${baseId}-${el.type}-${el.name ?? el.text}-${index}`;
      return <Fragment key={key}>{getEl(baseId, el)}</Fragment>;
    });
  }

  if ('type' in astElement && astElement.type === 'text') {
    return <span>{astElement.content || ''}</span>;
  }

  if ('type' in astElement && astElement.type === 'tag') {
    const children = astElement.children
      ? getEl(baseId, astElement.children)
      : null;
    switch (astElement.name) {
      case 'a':
        return (
          <Link color="inverse" href={String(astElement.attrs?.href || '#')}>
            {children}
          </Link>
        );
      case 'p':
        return (
          <Paragraph
            color="inverse"
            className={classnames('ams-mb-l', styles.Paragraph)}
          >
            {children}
          </Paragraph>
        );
      case 'h3':
        return (
          <Heading color="inverse" level={4} className="ams-mb-s">
            {children}
          </Heading>
        );
      case 'ul':
        return (
          <UnorderedList color="inverse" markers={false}>
            {children}
          </UnorderedList>
        );
      case 'li':
        return (
          <UnorderedList.Item className={styles.Link}>
            <div className={styles.FakeFooterLink}>
              <Icon svg={ChevronRightIcon} size="heading-5" />
              {children}
            </div>
          </UnorderedList.Item>
        );
      case 'strong':
        return (
          <>
            <strong>{children}</strong>{' '}
          </>
        );
      default:
        return null;
    }
  }
}

export function MainFooter({
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
    <PageFooter>
      <PageFooter.Spotlight>
        <Grid gapVertical="large" paddingVertical="large">
          {footer?.blocks.map((footerItem) => (
            <FooterBlock key={footerItem.id} {...footerItem} />
          ))}
        </Grid>
      </PageFooter.Spotlight>

      <PageFooter.Menu>
        {footer?.sub.map((link) => {
          return (
            <PageFooter.MenuLink key={link.title} href={link.to}>
              {link.title}
            </PageFooter.MenuLink>
          );
        })}
      </PageFooter.Menu>
    </PageFooter>
  );
}
