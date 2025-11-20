import { ReactNode } from 'react';

import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';

export interface ComponentProps {
  children?: ReactNode;
  title?: string;
  severity?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}

export default function ErrorAlert({
  children,
  title = 'Foutmelding',
  severity = 'error',
  className,
}: ComponentProps) {
  return (
    <DSAlert
      headingLevel={4}
      heading={title}
      severity={severity === 'info' ? undefined : severity}
      className={className}
    >
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}
