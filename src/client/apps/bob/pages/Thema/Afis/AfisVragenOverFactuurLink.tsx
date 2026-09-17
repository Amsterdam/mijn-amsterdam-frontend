import { Link } from '@amsterdam/design-system-react';

export function getVragenOverFactuurText(mailSubject: string) {
  return (
    <>
      Heeft u een vraag over één van uw facturen?
      <br />
      Stuur dan een e-mail naar{' '}
      <VragenOverFactuurLink
        mailSubject={`Vraag over factuur ${mailSubject}`}
      />
      .
    </>
  );
}

export function VragenOverFactuurLink({
  mailSubject = 'Vraag over facturen en betaalvoorkeuren',
}: {
  mailSubject?: string;
}) {
  return (
    <Link
      href={`mailto:debiteurenadministratie@amsterdam.nl?subject=${encodeURIComponent(mailSubject)}`}
    >
      debiteurenadministratie@amsterdam.nl
    </Link>
  );
}
