import classnames from 'classnames';
import {
  Footer,
  Grid,
  Heading,
  LinkList,
  PageMenu,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import type { AstNode, CMSFooterContent } from '../../../server/services';
import { LinkProps } from '../../../universal/types';
import { useCMSApi } from '../../hooks/api/useCmsApi';
import { useDesktopScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './MainFooter.module.scss';
import { MaLink } from '../MaLink/MaLink';

interface FooterBlockProps {
  id: string;
  title: string;
  links: LinkProps[];
  description: string | null | AstNode[];
}

function FooterBlock({ id, title, links, description }: FooterBlockProps) {
  const titleRole = useDesktopScreen() ? 'columnheader' : 'button';
  return (
    <Grid.Cell span={4} className={'page-footer-space-y '}>
      <Heading
        inverseColor={true}
        level={4}
        role={titleRole}
        className="ams-mb--xs"
      >
        {title}
      </Heading>
      {!!description && getEl(description as AstNode)}
      {!!links.length && (
        <UnorderedList markers={false}>
          {links.map((link) => (
            <LinkList key={link.title}>
              <LinkList.Link
                variant="inList"
                onBackground={'dark'}
                href={link.to}
              >
                {link.title}
              </LinkList.Link>
            </LinkList>
          ))}
        </UnorderedList>
      )}
    </Grid.Cell>
  );
}
function getEl(astElement: AstNode | AstNode[], index: number = 0) {
  if (Array.isArray(astElement) && astElement.length > 0) {
    return astElement.map((el, index) => getEl(el, index));
  }

  if ('type' in astElement && astElement.type === 'text') {
    return <>{astElement.content || ''}</>;
  }

  if ('type' in astElement && astElement.type === 'tag') {
    const children = astElement.children ? getEl(astElement.children) : null;

    switch (astElement.name) {
      case 'a':
        return (
          <MaLink
            key={index}
            href={String(astElement.attrs?.href || '#')}
            className={
              'ams-link-list__link ams-link-list__link--on-background-dark'
            }
          >
            {astElement.children?.[0]?.content || ''}
          </MaLink>
        );
      case 'p':
        return (
          <Paragraph inverseColor key={index} className={'ams-mb--xs'}>
            {children}
          </Paragraph>
        );
      case 'h3':
        return (
          <Heading inverseColor level={4} className={'ams-mb--xs'}>
            {astElement.children?.[0]?.content || ''}
          </Heading>
        );
      case 'ul':
        return (
          <UnorderedList inverseColor key={index} markers={false}>
            {children}
          </UnorderedList>
        );
      case 'li':
        return (
          <li className={styles.Link} key={index}>
            {children}
          </li>
        );
      case 'strong':
        return <strong>{children} </strong>;
      default:
        return null;
    }
  }

  return null; // Handle unexpected types accordingly
}

interface MainFooterProps {
  isAuthenticated: boolean;
}

export default function MainFooter({
  isAuthenticated = false,
}: MainFooterProps) {
  const atom = useAppStateGetter();
  const { CMS_CONTENT } = atom;
  const footer: CMSFooterContent | null = CMS_CONTENT.content?.footer || null;

  const { isLoading } = useCMSApi(isAuthenticated);
  return (
    <Footer>
      <Footer.Top className={classnames('page-footer-top', styles.FooterTop)}>
        <Grid gapVertical="large" paddingVertical="medium">
          <Heading className="ams-visually-hidden" inverseColor>
            Colofon
          </Heading>
          {isLoading && <div className={styles.FooterLoader}>...</div>}
          {footer?.blocks.map((footerItem) => (
            <FooterBlock key={footerItem.id} {...footerItem} />
          ))}
        </Grid>
      </Footer.Top>
      <Footer.Bottom>
        <Heading className="ams-visually-hidden" level={2}>
          Over deze website
        </Heading>
        <Grid paddingVertical="small">
          <Grid.Cell span="all">
            <PageMenu>
              {footer?.sub.map((link) => {
                return (
                  <MaLink
                    maVariant="noDefaultUnderline"
                    key={link.title}
                    href={link.to}
                  >
                    {link.title}
                  </MaLink>
                );
              })}
            </PageMenu>
          </Grid.Cell>
        </Grid>
      </Footer.Bottom>
    </Footer>
  );
}
