import {
  Field,
  Heading,
  Paragraph,
  Icon,
  Alert,
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
    content: <MediumValue medium={medium} />,
  }));

  return (
    <>
      <Datalist rows={rows} />
      <Alert
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
      </Alert>
      <Heading level={2} size="level-3">
        Hoe wilt u informatie van ons ontvangen?
      </Heading>
      <Paragraph className="ams-mb-l">
        Voor de volgende afdelingen van de gemeente is het mogelijk om uw
        voorkeur door te geven.
      </Paragraph>
      {voorkeurenList}
    </>
  );
}
