import sanitizeHtml from 'sanitize-html';
import React, { memo } from 'react';

const TAGS_ALLOWED = ['a', 'p', 'br', 'strong', 'em', 'i', 'b', 'div'];
const DEFAULT_CONFIG = {
  allowedSchemes: ['https'],
  disallowedTagsMode: 'escape',
};

interface SanitizedHtmlTagProps {
  wrapWithTagName?: keyof JSX.IntrinsicElements;
  children: string;
  allowedTags?: string[];
  className?: string;
}

function SanitizedHtmlTag({
  wrapWithTagName = 'div',
  children,
  allowedTags = TAGS_ALLOWED,
  className = '',
}: SanitizedHtmlTagProps) {
  const config = Object.assign(DEFAULT_CONFIG, { allowedTags });
  const Tag = wrapWithTagName;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(children, config) }}
    />
  );
}

export default memo(SanitizedHtmlTag);
