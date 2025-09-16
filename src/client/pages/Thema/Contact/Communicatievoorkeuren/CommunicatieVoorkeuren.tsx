import {
  Field,
  Heading,
  Paragraph,
  Icon,
  Alert,
} from '@amsterdam/design-system-react';
import { CheckmarkIcon, CloseIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router';

import { MediumValue } from './CommunicatieMediumValue';
import {
  MediumByTypeLabels,
  VoorkeurByTypeLabels,
} from './CommunicatieVoorkeuren-config';
import styles from './CommunicatieVoorkeuren.module.scss';
import { useCommunicatievoorkeuren } from './useCommunicatieVoorkeuren';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { MaRouterLink } from '../../../../components/MaLink/MaLink';

export function CommunicatieVoorkeuren() {
  const {
    voorkeuren,
    routeConfig,
    mediums,
    defaultMediumsByType,
    mediumsByType,
  } = useCommunicatievoorkeuren();

  const voorkeurenList = voorkeuren.map((voorkeur) => (
    <article key={voorkeur.id} className="ams-mb-xl">
      <Heading level={4} size="level-5">
        {voorkeur.stakeholder}
      </Heading>
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
                    {VoorkeurByTypeLabels[medium.type]}
                  </MaRouterLink>
                </span>
                <span className={styles.Switch}>
                  <Icon svg={medium.value ? CheckmarkIcon : CloseIcon} /> &nbsp;
                  {medium.value
                    ? `Ja${
                        medium.value !== defaultMediumsByType[medium.type].value
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

  const rows = mediums.map((medium) => ({
    label: MediumByTypeLabels[medium.type],
    content: <MediumValue medium={medium} mediumsByType={mediumsByType} />,
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
          Wij sturen nooit links in e-mails of sms-berichten.
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
  // <ThemaPaginaTable
  //   title={title}
  //   subTitle={
  //     <Paragraph className="ams-mb-m">
  //       Dit is een lijst van communicatievoorkeuren.
  //     </Paragraph>
  //   }
  //   zaken={voorkeuren}
  //   displayProps={displayProps}
  // />
}
