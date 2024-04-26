import {
  Alert as DSAlert,
  Paragraph,
  AlertProps,
} from '@amsterdam/design-system-react';
import { ComponentChildren } from '../../../universal/types';

export interface ComponentProps {
  children?: ComponentChildren;
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
    <DSAlert title={title} severity={severity} className={className}>
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}
