import React, { memo } from 'react';

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
  className,
}: InnerHtmlTagProps) {
  const Tag = wrapWithTagName;
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: children }} />
  );
}

export default memo(InnerHtmlTag);
