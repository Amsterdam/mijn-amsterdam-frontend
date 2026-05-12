import {
  Field,
  Heading,
  Paragraph,
  Icon,
  Link,
} from '@amsterdam/design-system-react';
import { CheckMarkIcon, CloseIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router';

import { MediumValue } from './CommunicatieMediumValue.tsx';
import {
  MediumByTypeLabels,
  VoorkeurByTypeLabels,
} from './CommunicatieVoorkeuren-config.ts';
import styles from './CommunicatieVoorkeuren.module.scss';
import type { useCommunicatievoorkeuren } from './useCommunicatieVoorkeuren.tsx';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';

export function CommunicatieVoorkeuren({
  communicatievoorkeurenData,
}: {
  communicatievoorkeurenData: ReturnType<typeof useCommunicatievoorkeuren>;
}) {
  const { voorkeuren, defaultMediumsByType, routeConfig } =
    communicatievoorkeurenData ?? {};

  const voorkeurenList = voorkeuren.map((voorkeur) => (
    <article key={voorkeur.id} className="ams-mb-xl">
      <Heading level={4}>{voorkeur.stakeholder}</Heading>
      <Paragraph className="ams-mb-s">{voorkeur.description}</Paragraph>

      <ul className={styles.VoorkeurInstellingen}>
        {voorkeur.settings.map((medium) => {
          return (
            <li key={voorkeur.id + medium.type}>
              <Field className={styles.SwitchField}>
                <span className={styles.SwitchFieldLink}>
                  <MaRouterLink
                    maVariant="fatNoDefaultUnderline"
                    href={generatePath(
                      routeConfig.detailPageCommunicatievoorkeurInstellen.path,
                      { medium: medium.type, id: voorkeur.id, step: '1' }
                    )}
                  >
                    {
                      VoorkeurByTypeLabels[
                        medium.type as keyof typeof VoorkeurByTypeLabels
                      ]
                    }
                  </MaRouterLink>
                </span>
                <span className={styles.Switch}>
                  <Icon svg={medium.value ? CheckMarkIcon : CloseIcon} /> &nbsp;
                  {medium.value && defaultMediumsByType
                    ? `Ja${
                        medium.value !==
                        defaultMediumsByType[
                          medium.type as keyof typeof defaultMediumsByType
                        ].value
                          ? `, naar ${medium.value}`
                          : ''
                      }`
                    : 'Nee'}
                </span>
              </Field>
            </li>
          );
        })}
      </ul>
    </article>
  ));

  const rows = Object.values(defaultMediumsByType ?? {}).map((medium) => ({
    label: MediumByTypeLabels[medium.type as keyof typeof MediumByTypeLabels],
    content: (
      <article className={styles.MediumValue}>
        <MediumValue medium={medium} />
      </article>
    ),
  }));

  return (
    <>
      <Heading level={2}>Mijn contactgegevens</Heading>
      <Paragraph className="ams-mb-l">
        Via welk medium u geinformeerd wilt worden als er bijvoorbeeld een
        bericht voor u klaar staat of een status van een product is veranderd
      </Paragraph>
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
      <Heading level={2}>Mijn communicatievoorkeuren</Heading>
      <Paragraph className="ams-mb-l">
        Nog niet alle diensten van de gemeente zijn aangesloten bij de generieke
        communicatievoorkeuren. Het kan dus zijn dat er nog elders binnen de
        gemeente contactgegevens van u worden gebruikt voor berichtgeving over
        thema's die niet hieronder staan benoemd. Heeft u daar vragen over bel
        dan naar{' '}
        <Link href="tel:14020" rel="noopener noreferrer">
          14020
        </Link>
        .
      </Paragraph>
      {voorkeurenList}
    </>
  );
}
