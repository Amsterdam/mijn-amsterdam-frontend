import {
  Heading,
  Paragraph,
  UnorderedList,
  Checkbox,
  Alert,
} from '@amsterdam/design-system-react';

import { MediumValue } from './CommunicatieMediumValue.tsx';
import { MediumByTypeLabels } from './CommunicatieVoorkeuren-config.ts';
import styles from './CommunicatieVoorkeuren.module.scss';
import type {
  CommunicatievoorkeurFrontend,
  ContactvoorkeurPerTypeFrontend,
  DienstSource,
} from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';

type CommunicatieVoorkeurenProps = {
  voorkeuren: CommunicatievoorkeurFrontend[];
  standaardContactvoorkeurPerType: ContactvoorkeurPerTypeFrontend | null;
  aangeslotenDiensten?: DienstSource[];
};

export function CommunicatieVoorkeuren({
  voorkeuren,
  aangeslotenDiensten,
  standaardContactvoorkeurPerType,
}: CommunicatieVoorkeurenProps) {
  const rows = Object.values(standaardContactvoorkeurPerType ?? {})
    .filter((medium) => !medium.disabled)
    .map((medium) => ({
      label: MediumByTypeLabels[medium.type as keyof typeof MediumByTypeLabels],
      content: (
        <article className={styles.MediumValue}>
          <MediumValue medium={medium} />
        </article>
      ),
    }));

  const hasValidatedEmail = !!(
    standaardContactvoorkeurPerType?.email?.value &&
    standaardContactvoorkeurPerType.email.isValidated
  );

  return (
    <>
      <div className="ams-mb-l">
        <Heading level={2}>Post per e-mail</Heading>
        <Paragraph className="ams-mb-s">
          U kunt voor de volgende diensten post per e-mail ontvangen:
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
              Ja, ik wil post per e-mail ontvangen voor bovenstaande diensten.
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
