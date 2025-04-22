import { Link } from '@amsterdam/design-system-react';

export function getMailBody(
  dossierNummer?: string,
  relatieCode?: string,
  debiteurNummer?: string
) {
  return `Dossiernummer: ${dossierNummer ?? '-'}%0D%0ARelatiecode: ${
    relatieCode ?? '-'
  }%0D%0ADebiteurnummer: ${debiteurNummer ?? '-'}`;
}

interface WijzigenLinkProps {
  debiteurNummer?: string;
  dossierNummer?: string;
  email?: string;
  label?: string;
  linkVariant?: 'inList';
  relatieCode?: string;
  subject?: string;
}

export function WijzigenLink({
  dossierNummer,
  relatieCode,
  debiteurNummer,
  label = 'Betaler aanpassen',
  email = 'debiteurenadministratie@amsterdam.nl',
  subject = 'Betaler wijzigen',
  linkVariant,
}: WijzigenLinkProps) {
  return (
    <Link
      href={`mailto:${email}?subject=${subject}&body=${getMailBody(
        dossierNummer,
        relatieCode,
        debiteurNummer
      )}`}
      rel="noopener noreferrer"
      variant={linkVariant}
    >
      {label}
    </Link>
  );
}
