import { productName } from '../helpers';
import { WpiRequestStatusLabels } from '../wpi-types';
import { requestProcess as tozoRequestProcess } from './tozo';

const beslisTermijnLabels: WpiRequestStatusLabels = {
  notification: {
    title: (requestProcess) => `${requestProcess.about}: Meer tijd nodig`,
    description: (requestProcess) =>
      `Wij hebben meer tijd nodig om uw aanvraag te behandelen.`,
  },
  description: (requestProcess) =>
    `<p>Wij hebben meer tijd nodig om uw aanvraag te behandelen. Bekijk de brief voor meer details.</p>`,
};

const akteLabels: WpiRequestStatusLabels = {
  notification: {
    title: (requestProcess) =>
      `${requestProcess.about}: Onderteken de akte voor bedrijfskapitaal`,
    description: (requestProcess) =>
      `Wij kunnen de lening voor bedrijfskapitaal uitbetalen als u de akte voor bedrijfskapitaal hebt ondertekend.`,
  },
  description: (requestProcess) =>
    `<p>Wij kunnen de lening voor bedrijfskapitaal uitbetalen als u de akte voor bedrijfskapitaal hebt ondertekend. Bekijk de brief voor meer details.</p>`,
};

const briefAdviesRapportLabels: WpiRequestStatusLabels = {
  notification: {
    title: (requestProcess, statusStep) =>
      `${requestProcess.about}: Meer informatie nodig`,
    description: () =>
      `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
  },
  description: () =>
    `<p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.
        Bekijk de brief voor meer details.
      </p>`,
};

const besluitLabels: WpiRequestStatusLabels = {
  notification: tozoRequestProcess.besluit.notification,
  description: (requestProcess, statusStep) => {
    switch (statusStep?.decision) {
      case 'toekenning':
        return `<p>
        U hebt recht op ${productName(
          requestProcess,
          statusStep
        )}. Bekijk de brief voor meer details.
      </p>
      ${
        statusStep.productSpecific !== 'lening'
          ? "<p>Wilt u een wijziging in uw inkomen doorgeven? <a rel='external noopener noreferrer' class='inline' href='https://www.amsterdam.nl/ondernemen/ondersteuning/bijstand-zelfstandigen/wijzigingen-doorgeven/'>Kijk dan bij 'Wijziging of inkomsten doorgeven'</a></p>"
          : ''
      }<p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`;

      case 'toekenningVoorlopig':
        return `<p>
          U hebt recht op ${productName(
            requestProcess,
            statusStep
          )}. Kijk voor de voorwaarden in de brief.
        </p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`;

      default:
        return tozoRequestProcess.besluit.description(
          requestProcess,
          statusStep
        );
    }
  },
};

export const requestProcess = {
  aanvraag: tozoRequestProcess.aanvraag,
  voorschot: tozoRequestProcess.voorschot,
  herstelTermijn: tozoRequestProcess.herstelTermijn,
  inkomstenwijziging: tozoRequestProcess.inkomstenwijziging,
  terugvorderingsbesluit: tozoRequestProcess.terugvorderingsbesluit,
  besluit: besluitLabels,
  intrekking: tozoRequestProcess.intrekking,
  briefAdviesRapport: briefAdviesRapportLabels,
  briefAkteBedrijfskapitaal: akteLabels,
  beslisTermijn: beslisTermijnLabels,
};
