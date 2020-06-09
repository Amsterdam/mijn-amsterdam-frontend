// import sanitizeHtml from 'sanitize-html';
import React, { memo } from 'react';

function sanitizeHtml(items: any, config: any) {
  return items;
}

const TAGS_ALLOWED = ['a', 'p', 'br', 'strong', 'em', 'i', 'b', 'div', 'u'];
const ATTR_ALLOWED = {
  a: ['href', 'name', 'target', 'rel'],
};
const DEFAULT_CONFIG = {
  allowedSchemes: ['https'],
  disallowedTagsMode: 'escape',
};

interface InnerHtmlTagProps {
  wrapWithTagName?: keyof JSX.IntrinsicElements;
  children: string;
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  className?: string;
}

function InnerHtmlTag({
  wrapWithTagName = 'div',
  children,
  allowedTags = TAGS_ALLOWED,
  allowedAttributes = ATTR_ALLOWED,
  className,
}: InnerHtmlTagProps) {
  const config = Object.assign(DEFAULT_CONFIG, {
    allowedTags,
    allowedAttributes,
  });
  const Tag = wrapWithTagName;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(children, config) }}
    />
  );
}

export default memo(InnerHtmlTag);
