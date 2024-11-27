import { ReactNode } from 'react';

import {
  Heading,
  Icon,
  Link,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { ChevronRightIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';
import { Fragment } from 'react/jsx-runtime';

import { AstNode } from '../../universal/types';

// This function transforms an AST (Abstract Syntax Tree) element or an array of AST elements into React components.
export function transformAstToReact(
  baseId: string,
  astElement: AstNode | AstNode[],
  inverseColor = false
): ReactNode {
  if (Array.isArray(astElement)) {
    return astElement.map((el, index) => {
      // Not an ideal key as it uses index, it's hard to find suitable key value in these ast nodes without completely traversing the
      // tree in search for a unique identifier.
      const key = `${baseId}-${el.type}-${el.name ?? el.text}-${index}`;
      return (
        <Fragment key={key}>
          {transformAstToReact(baseId, el, inverseColor)}
        </Fragment>
      );
    });
  }

  if ('type' in astElement && astElement.type === 'text') {
    return <span>{astElement.content || ''}</span>;
  }

  if ('type' in astElement && astElement.type === 'tag') {
    const children = astElement.children
      ? transformAstToReact(baseId, astElement.children, inverseColor)
      : null;
    switch (astElement.name) {
      case 'a':
        return (
          <Link
            inverseColor={inverseColor}
            variant="standalone"
            href={String(astElement.attrs?.href || '#')}
          >
            {children}
          </Link>
        );
      case 'p':
        return (
          <Paragraph
            inverseColor={inverseColor}
            className={classnames('ams-mb--xs')}
          >
            {children}
          </Paragraph>
        );
      case 'h3':
        return (
          <Heading inverseColor={inverseColor} level={4} className="ams-mb--xs">
            {children}
          </Heading>
        );
      case 'ul':
        return (
          <UnorderedList inverseColor={inverseColor} markers={false}>
            {children}
          </UnorderedList>
        );
      case 'li':
        return (
          <UnorderedList.Item>
            <Icon svg={ChevronRightIcon} size="level-5" />
            {children}
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
