import {
  Heading,
  Paragraph,
  UnorderedList,
  Checkbox,
  Alert,
} from '@amsterdam/design-system-react';

import { ContactgegevenByTypeLabels } from './CommunicatieVoorkeuren-config.ts';
import styles from './CommunicatieVoorkeuren.module.scss';
import { ContactgegevenValue } from './ContactgegevenValue.tsx';
import type {
  ContactgegevenPerTypeFrontend,
  DienstSource,
} from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

type CommunicatieVoorkeurenProps = {
  standaardContactgegevens: ContactgegevenPerTypeFrontend | null;
  aangeslotenDiensten?: DienstSource[];
};

export function CommunicatieVoorkeuren({
  aangeslotenDiensten,
  standaardContactgegevens,
}: CommunicatieVoorkeurenProps) {
  const rows = Object.values(standaardContactgegevens ?? {})
    .filter((contactgegeven) => !contactgegeven.disabled)
    .map((contactgegeven) => ({
      label:
        ContactgegevenByTypeLabels[
          contactgegeven.type as keyof typeof ContactgegevenByTypeLabels
        ],
      content: (
        <article className={styles.MediumValue}>
          <ContactgegevenValue contactgegeven={contactgegeven} />
        </article>
      ),
    }));

  const hasValidatedEmail = !!(
    standaardContactgegevens?.Email?.value &&
    standaardContactgegevens.Email.isValidated
  );

  return (
    <>
      <div className="ams-mb-l">
        <Heading level={2}>Post per e-mail</Heading>
        <Paragraph className="ams-mb-s">
          U kunt post van de gemeente Amsterdam per e-mail ontvangen. U krijgt
          dan post van onderstaande diensten. Er kunnen meer diensten worden
          toegevoegd in de toekomst.
        </Paragraph>
        <UnorderedList className="ams-mb-m">
          {aangeslotenDiensten?.map((dienst) => (
            <UnorderedList.Item key={dienst.id}>
              <Paragraph>
                <strong>{dienst.beschrijving}</strong>
                {/* <br />
                {dienst.dienstBeschrijving} */}
              </Paragraph>
            </UnorderedList.Item>
          ))}
        </UnorderedList>
        {!hasValidatedEmail && (
          <Alert
            severity="warning"
            heading="E-mailadres ontbreekt"
            headingLevel={3}
          >
            <Paragraph>
              U heeft nog geen gevalideerd e-mailadres gekoppeld. Hieronder kunt
              u uw e-mailadres instellen en valideren.
            </Paragraph>
          </Alert>
        )}
        {hasValidatedEmail && (
          <form>
            <Checkbox
              id=""
              onChange={function fie() {}}
              onClick={function fie() {}}
            >
              Ja, ik wil post per e-mail ontvangen van de gemeente Amsterdam.
            </Checkbox>
          </form>
        )}
      </div>
      <div>
        <Heading level={2} className="ams-mb-l">
          Mijn contactgegevens
        </Heading>
        <Datalist rows={rows} />
        {/* <Alert
        severity="warning"
        heading="Let op!"
        headingLevel={3}
        className="ams-mb-m"
      >
        <Paragraph>
          Wij sturen geen <Link href="#">links</Link> in e-mails of sms
          berichten.
          <br />
          Vetrouwt u iets niet, neem dan contact op met de gemeente.
        </Paragraph>
      </Alert> */}
      </div>
    </>
  );
}
