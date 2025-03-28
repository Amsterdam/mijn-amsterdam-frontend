import { documentDownloadName, productName } from '../helpers';
import { WpiRequestStatusLabels } from '../wpi-types';
import { requestProcess as tozoRequestProcess } from './tozo';

export const LINK_MEER_INFO =
  '<a rel="external noopener noreferrer" class="ams-link" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a>';

const weigeringVerlengingLabels: WpiRequestStatusLabels = {
  notification: {
    title: (requestProcess, statusStep) =>
      `${statusStep.about || requestProcess.about}: Verlenging geweigerd`,
    description: (requestProcess, statusStep) =>
      `U heeft de verlenging van uw ${productName(
        requestProcess,
        statusStep,
        false
      )} geweigerd.`,
  },
  description: (requestProcess, statusStep) =>
    `<p>U heeft uw ${
      statusStep.about || requestProcess.about
    } verlenging geweigerd. Bekijk de brief voor meer details.</p><p>${LINK_MEER_INFO}</p>`,
};

const correctieMailLabels: WpiRequestStatusLabels = {
  notification: {
    title: () => `Mail over verkeerde TONK-brief ontvangen`,
    description: () =>
      `U heeft een mail gekregen omdat u een verkeerde TONK-brief hebt ontvangen.`,
    link: (requestProcess, statusStep) => {
      const [document] = statusStep!.documents!;
      return {
        to: `${document?.url}`,
        title: 'Bekijk de mail',
        download: documentDownloadName({
          datePublished: requestProcess.datePublished, // '2021-07-15T00:00:00+01:00'
          title: 'TONK-brief',
        }),
      };
    },
  },
  description: () =>
    `<p>U heeft een mail gekregen omdat u een verkeerde TONK-brief hebt ontvangen. Bekijk de mail voor meer details.</p><p>${LINK_MEER_INFO}</p>`,
};

const besluitLabels: WpiRequestStatusLabels = {
  notification: {
    title: (requestProcess, statusStep) => {
      switch (statusStep?.decision) {
        case 'mogelijkeVerlenging':
          return `${
            statusStep.about || requestProcess.about
          }: Er is een besluit over het wel of niet verlengen`;

        case 'verlenging':
          return `${
            statusStep.about || requestProcess.about
          }: Uw uitkering is verlengd`;

        default:
          return tozoRequestProcess.besluit.notification.title(
            requestProcess,
            statusStep
          );
      }
    },
    description: (requestProcess, statusStep) => {
      switch (statusStep?.decision) {
        case 'mogelijkeVerlenging':
          return `Er is een besluit over het wel of niet verlengen van uw ${productName(
            requestProcess,
            statusStep,
            false
          )}.`;

        case 'verlenging':
          return `Uw ${productName(
            requestProcess,
            statusStep,
            false
          )} is verlengd.`;

        default:
          return tozoRequestProcess.besluit.notification.description(
            requestProcess,
            statusStep
          );
      }
    },
  },
  description: (requestProcess, statusStep) => {
    switch (statusStep?.decision) {
      case 'mogelijkeVerlenging':
        return `<p>Wij hebben een besluit genomen over het wel of niet verlengen van uw ${productName(
          requestProcess,
          statusStep,
          false
        )}. Bekijk de brief voor meer details.</p><p>${LINK_MEER_INFO}</p>`;

      case 'verlenging':
        return `<p>U heeft recht op verlenging van ${productName(
          requestProcess,
          statusStep
        )}. Bekijk de brief voor meer details.</p><p>${LINK_MEER_INFO}</p>`;

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
  herstelTermijn: tozoRequestProcess.herstelTermijn,
  besluit: besluitLabels,
  intrekking: tozoRequestProcess.intrekking,
  correctiemail: correctieMailLabels,
  briefWeigering: weigeringVerlengingLabels,
};
