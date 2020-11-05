import React, { memo } from 'react';

interface InnerHtmlTagProps {
  el?: keyof JSX.IntrinsicElements;
  children: string;
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  className?: string;
}

function InnerHtmlTag({ el = 'div', children, className }: InnerHtmlTagProps) {
  const Tag = el;
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: children }} />
  );
}

export default memo(InnerHtmlTag);
