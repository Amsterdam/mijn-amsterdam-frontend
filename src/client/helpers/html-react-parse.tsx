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

    if (!domNode || !domNode.name) {
      return domNode;
    }

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
      case 'p':
        return (
          <Paragraph {...withClassNames(attribs, 'ams-mb-s')}>
            {domToReact(children_, options)}
          </Paragraph>
        );
      case 'h2':
      case 'h3':
      case 'h4': {
        const level = parseInt(domNode.name.replace(/[^\d]/g, ''), 10) as
          | 2
          | 3
          | 4;
        return (
          <Heading level={level} {...withClassNames(attribs, 'ams-mb-s')}>
            {domToReact(children_, options)}
          </Heading>
        );
      }
      case 'li':
        return (
          <UnorderedList.Item {...attributesToProps(attribs)}>
            {domToReact(children_, options)}
          </UnorderedList.Item>
        );
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
