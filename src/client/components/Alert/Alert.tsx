import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';
import { ComponentChildren } from '../../../universal/types';

export interface ComponentProps {
  children?: ComponentChildren;
  title?: string;
}

export function ErrorAlert({
  children,
  title = 'Foutmelding',
}: ComponentProps) {
  return (
    <DSAlert title={title} severity="error">
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}

export default function OUDE_ALERT_WEGHALEN({
  children,
  type = 'success',
  className,
}: any) {
  return (
    <div style={{ border: '5px solid red' }}>
      <strong>WEGHALEN!!!?</strong>
      {children}
    </div>
  );
}
