import { Link, Paragraph } from '@amsterdam/design-system-react';

import {
  getFullAddress,
  getFullName,
} from '../../../../universal/helpers/brp.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';

export type MissingDocumentMailtoConfig = {
  to: string;
  subject: string;
  body: string;
  linkText?: string;
  includeUserSignature?: boolean;
};

type MissingDocumentMailtoProps = {
  config: MissingDocumentMailtoConfig;
};

export function MissingDocumentMailto({ config }: MissingDocumentMailtoProps) {
  const SEPARATOR = '\r\n';

  const appState = useAppStateGetter();
  const fullName = appState.BRP?.content?.persoon
    ? getFullName(appState.BRP.content.persoon)
    : '[naam]';
  const fullAddress = appState.BRP?.content?.adres
    ? getFullAddress(appState.BRP.content?.adres, true, false, SEPARATOR)
    : '[adres]';

  const signature = config.includeUserSignature
    ? `${SEPARATOR}${SEPARATOR}Met vriendelijke groet,${SEPARATOR}${SEPARATOR}${fullName}${SEPARATOR}${SEPARATOR}${fullAddress}`
    : '';

  const normalizeNewlines = (value: string) =>
    value.replace(/\r?\n/g, SEPARATOR);

  const subject = encodeURIComponent(config.subject);
  const body = encodeURIComponent(
    normalizeNewlines(`${config.body}${signature}`)
  );
  const mailtoWithSubjectAndBody = `mailto:${config.to}?subject=${subject}&body=${body}`;

  return (
    <Paragraph>
      <strong>Ziet u niet het juiste document?</strong> Stuur een mail naar:{' '}
      <Link href={mailtoWithSubjectAndBody} rel="noreferrer">
        {config.linkText ?? config.to}
      </Link>{' '}
      om uw document op te vragen.
    </Paragraph>
  );
}
