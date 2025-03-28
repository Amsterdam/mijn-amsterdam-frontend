import { ReactNode } from 'react';

import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';

export interface ComponentProps {
  children?: ReactNode;
  title?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
}

export default function ErrorAlert({
  children,
  title = 'Foutmelding',
  severity = 'error',
  className,
}: ComponentProps) {
  return (
    <DSAlert heading={title} severity={severity} className={className}>
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}
