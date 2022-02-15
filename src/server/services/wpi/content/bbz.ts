import { BbzRequestProcessLabels } from '../focus-types';
import { productName } from '../helpers';
import { requestProcess as tozoRequestProcess } from './tozo';

const beslisTermijnLabels: BbzRequestProcessLabels['beslisTermijn'] = {
  notification: {
    title: (requestProcess) => `${requestProcess.title}: Meer tijd nodig`,
    description: (requestProcess) =>
      `Wij hebben meer tijd nodig om uw aanvraag te behandelen.`,
  },
  description: (requestProcess) =>
    `<p>Wij hebben meer tijd nodig om uw aanvraag te behandelen. Bekijk de brief voor meer details.</p>`,
};

const akteLabels: BbzRequestProcessLabels['briefAkteBedrijfskapitaal'] = {
  notification: {
    title: (requestProcess) =>
      `${requestProcess.title}: Onderteken de akte voor bedrijfskapitaal`,
    description: (requestProcess) =>
      `Wij kunnen de lening voor bedrijfskapitaal uitbetalen als u de akte voor bedrijfskapitaal hebt ondertekend.`,
  },
  description: (requestProcess) =>
    `<p>Wij kunnen de lening voor bedrijfskapitaal uitbetalen als u de akte voor bedrijfskapitaal hebt ondertekend. Bekijk de brief voor meer details.</p>`,
};

const briefAdviesRapportLabels: BbzRequestProcessLabels['briefAdviesRapport'] =
  {
    notification: {
      title: (requestProcess, statusStep) =>
        `${requestProcess.title}: Meer informatie nodig`,
      description: (requestProcess, statusStep) =>
        `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
    },
    description: (requestProcess, statusStep) =>
      `<p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.
        Bekijk de brief voor meer details.
      </p>`,
  };

const bbzProcessAlias =
  tozoRequestProcess as unknown as BbzRequestProcessLabels;

const besluitLabels: BbzRequestProcessLabels['besluit'] = {
  notification: bbzProcessAlias.besluit.notification,
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
        return bbzProcessAlias.besluit.description(requestProcess, statusStep);
    }
  },
};

export const requestProcess: BbzRequestProcessLabels = {
  aanvraag: bbzProcessAlias.aanvraag,
  voorschot: bbzProcessAlias.voorschot,
  herstelTermijn: bbzProcessAlias.herstelTermijn,
  inkomstenwijziging: bbzProcessAlias.inkomstenwijziging,
  terugvorderingsbesluit: bbzProcessAlias.terugvorderingsbesluit,
  besluit: besluitLabels,
  intrekking: bbzProcessAlias.intrekking,
  briefAdviesRapport: briefAdviesRapportLabels,
  briefAkteBedrijfskapitaal: akteLabels,
  beslisTermijn: beslisTermijnLabels,
};
