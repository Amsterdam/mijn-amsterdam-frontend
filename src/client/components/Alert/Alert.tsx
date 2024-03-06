import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';
import { ComponentChildren } from '../../../universal/types';

export interface ComponentProps {
  children?: ComponentChildren;
  severity?: 'error' | 'info'; // NOTE: For the moment we are not using warning and success variants.
}

export default function Alert({
  children,
  severity = 'error',
}: ComponentProps) {
  return (
    <DSAlert title="Foutmelding" severity={severity}>
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}
