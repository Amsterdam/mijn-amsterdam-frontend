import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';
import { ComponentChildren } from '../../../universal/types';

export interface ComponentProps {
  children?: ComponentChildren;
  severity?: 'error' | 'info'; // NOTE: For the moment we are not using warning and success variants.
  title?: string;
}

export default function Alert({
  children,
  severity = 'error',
  title = 'Foutmelding',
}: ComponentProps) {
  return (
    <DSAlert title={title} severity={severity}>
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}
