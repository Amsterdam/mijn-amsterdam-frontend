import classnames from 'classnames';
import {
  Footer,
  Grid,
  Heading,
  Icon,
  Link,
  LinkList,
  PageMenu,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import type { AstNode, CMSFooterContent } from '../../../server/services';
import { LinkProps } from '../../../universal/types';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './MainFooter.module.scss';
import { ChevronRightIcon } from '@amsterdam/design-system-react-icons';
import { Fragment, ReactNode, useId } from 'react';

interface FooterBlockProps {
  id: string;
  title: string;
  links: LinkProps[];
  description: string | null | AstNode[];
}

function FooterBlock({ id, title, links, description }: FooterBlockProps) {
  return (
    <Grid.Cell key={title} span={4} className="page-footer-space-y">
      <Heading inverseColor level={4} className="ams-mb--xs">
        {title}
      </Heading>
      {!!description && getEl(description as AstNode)}
      {!!links.length && (
        <LinkList>
          {links.map((link) => (
            <LinkList.Link key={link.to} onBackground="dark" href={link.to}>
              {link.title}
            </LinkList.Link>
          ))}
        </LinkList>
      )}
    </Grid.Cell>
  );
}

function getEl(astElement: AstNode | AstNode[]): ReactNode {
  const ui = useId();
  if (Array.isArray(astElement)) {
    return astElement.map((el) => getEl(el));
  }

  if ('type' in astElement && astElement.type === 'text') {
    return <span key={ui}>{astElement.content || ''}</span>;
  }

  if ('type' in astElement && astElement.type === 'tag') {
    const children = astElement.children ? getEl(astElement.children) : null;
    switch (astElement.name) {
      case 'a':
        return (
          <Link
            key={ui}
            onBackground="dark"
            variant="standalone"
            href={String(astElement.attrs?.href || '#')}
            className="ams-link-list__link ams-link-list__link--on-background-dark"
          >
            {children}
          </Link>
        );
      case 'p':
        return (
          <Paragraph
            key={ui}
            inverseColor
            className={classnames('ams-mb--xs', styles.Paragraph)}
          >
            {children}
          </Paragraph>
        );
      case 'h3':
        return (
          <Heading key={ui} inverseColor level={4} className="ams-mb--xs">
            {children}
          </Heading>
        );
      case 'ul':
        return (
          <UnorderedList key={ui} inverseColor markers={false}>
            {children}
          </UnorderedList>
        );
      case 'li':
        return (
          <UnorderedList.Item key={ui} className={styles.Link}>
            <Icon key={ui + '-icon'} svg={ChevronRightIcon} size="level-5" />
            <div key={ui + '-children'}>{children}</div>
          </UnorderedList.Item>
        );
      case 'strong':
        return (
          <Fragment key={ui}>
            <strong key={ui}>{children}</strong>{' '}
          </Fragment>
        );
      default:
        return null;
    }
  }
}

export default function MainFooter() {
  const atom = useAppStateGetter();
  const { CMS_CONTENT } = atom;
  const footer: CMSFooterContent | null = CMS_CONTENT.content?.footer || null;
  return (
    <Footer>
      <Footer.Top className={classnames('page-footer-top', styles.FooterTop)}>
        <Grid gapVertical="large" paddingVertical="medium">
          {footer?.blocks.map((footerItem) => (
            <FooterBlock key={footerItem.id} {...footerItem} />
          ))}
        </Grid>
      </Footer.Top>
      <Footer.Bottom>
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
