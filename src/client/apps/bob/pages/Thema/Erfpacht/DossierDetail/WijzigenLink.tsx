import { Link } from '@amsterdam/design-system-react';

export function getMailBody(
  debiteurNummer: string | null,
  dossierNummer?: string,
  relatieCode?: string
) {
  return `Dossiernummer: ${dossierNummer ?? '-'}%0D%0ARelatiecode: ${
    relatieCode ?? '-'
  }%0D%0ADebiteurnummer: ${debiteurNummer ?? '-'}`;
}

interface WijzigenLinkProps {
  debiteurNummer: string | null;
  dossierNummer?: string;
  email?: string;
  label?: string;
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
}: WijzigenLinkProps) {
  return (
    <Link
      href={`mailto:${email}?subject=${subject}&body=${getMailBody(
        debiteurNummer,
        dossierNummer,
        relatieCode
      )}`}
      rel="noopener noreferrer"
    >
      {label}
    </Link>
  );
}
