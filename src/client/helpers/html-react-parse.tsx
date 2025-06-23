/* eslint-disable no-magic-numbers */
import {
  Paragraph,
  Heading,
  UnorderedList,
  OrderedList,
  Link,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';
import parse, {
  attributesToProps,
  type HTMLReactParserOptions,
  type DOMNode,
  type Element,
  domToReact,
} from 'html-react-parser';

import { MaRouterLink } from '../components/MaLink/MaLink';

function getNextNonTextNode(
  domNode: Element,
  level: number = 0
): Element | null {
  if (!domNode) {
    return null;
  }
  const nextNode = domNode.next;
  if (!nextNode && domNode.type === 'tag' && level > 0) {
    return domNode;
  }
  if (nextNode && nextNode?.type !== 'tag') {
    // If the next node is not a tag, we skip it and look for the next one.
    if (!nextNode.next) {
      return null;
    }
    return getNextNonTextNode(nextNode.next as Element, level + 1);
  }
  return nextNode;
}

function withClassNames(
  attribs: { [name: string]: string },
  className: string
) {
  const attribs_ = {
    ...attribs,
    ['class']: classNames(attribs?.class ?? '', className),
  };
  return attributesToProps(attribs_);
}

const options: HTMLReactParserOptions = {
  replace(domNode: DOMNode) {
    if (!domNode || !('name' in domNode)) {
      return domNode;
    }

    const { attribs, children } = domNode as Element;
    const children_ = (children || []) as DOMNode[];

    switch (domNode.name) {
      case 'a': {
        if (attribs.href?.startsWith('/')) {
          return (
            <MaRouterLink {...attributesToProps(attribs)}>
              {domToReact(children_, options)}
            </MaRouterLink>
          );
        }
        return (
          <Link {...attributesToProps(attribs)}>
            {domToReact(children_, options)}
          </Link>
        );
      }
      case 'p': {
        const nextNode = getNextNonTextNode(domNode as Element);
        let bottomSpacing = '';
        // Adds an extra margin if the next sibling is not a paragraph to visually separate different sections.
        if (nextNode) {
          bottomSpacing = nextNode?.name !== 'p' ? 'ams-mb-xl' : 'ams-mb-m';
        }
        return (
          <Paragraph {...withClassNames(attribs, bottomSpacing)}>
            {domToReact(children_, options)}
          </Paragraph>
        );
      }
      case 'h2':
      case 'h3':
      case 'h4': {
        const level = parseInt(domNode.name[1], 10) as 2 | 3 | 4;
        return (
          <Heading level={level} {...withClassNames(attribs, 'ams-mb-s')}>
            {domToReact(children_, options)}
          </Heading>
        );
      }
      case 'li': {
        const parentTag = (domNode.parent as Element)?.name;
        const ListItem =
          parentTag === 'ol' ? OrderedList.Item : UnorderedList.Item;
        return (
          <ListItem {...attributesToProps(attribs)}>
            {domToReact(children_, options)}
          </ListItem>
        );
      }
      case 'ul':
      case 'ol': {
        const List =
          (domNode.name as keyof JSX.IntrinsicElements) === 'ul'
            ? UnorderedList
            : OrderedList;
        return (
          <List {...withClassNames(attribs, 'ams-mb-xl')}>
            {domToReact(children_, options)}
          </List>
        );
      }
    }
    return domNode;
  },
};

export function parseHTML(
  html: string | undefined | null
): ReturnType<typeof domToReact> | null {
  if (!html) {
    return null;
  }
  return parse(html, options);
}
