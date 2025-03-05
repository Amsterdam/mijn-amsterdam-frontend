import { Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './ParagraphSuppressed.module.scss';

export function ParagaphSuppressed({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Paragraph className={classNames(className, styles.SuppressedParagraph)}>
      {children}
    </Paragraph>
  );
}
