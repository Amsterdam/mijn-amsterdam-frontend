import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../../universal/config';
import { API_BASE_PATH } from '../../../../universal/config/api';
import { documentDownloadName } from '../focus-specificaties';
import { TONKRequestProcessLabels } from '../focus-types';
import { productName, requestProcess as tozoRequestProcess } from './tozo';

const weigeringVerlengingLabels: TONKRequestProcessLabels['briefWeigering'] = {
  notification: {
    title: (requestProcess) => `${requestProcess.title}: Verlenging geweigerd`,
    description: (requestProcess, statusStep) =>
      `U hebt de verlenging van uw ${productName(
        requestProcess,
        statusStep,
        false
      )} geweigerd.`,
  },
  description: (requestProcess) =>
    `<p> U hebt uw ${requestProcess.title} verlenging geweigerd. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const correctieMailLabels: TONKRequestProcessLabels['correctiemail'] = {
  notification: {
    title: () => `Mail over verkeerde TONK-brief ontvangen`,
    description: () =>
      `U hebt een mail gekregen omdat u een verkeerde TONK-brief hebt ontvangen.`,
    link: (requestProcess, statusStep) => {
      const [document] = statusStep!.documents!;
      return {
        to: `${API_BASE_PATH}/${document?.url}`,
        title: 'Bekijk de mail',
        download: documentDownloadName({
          datePublished: requestProcess.datePublished, // '2021-07-15T00:00:00+01:00'
          title: 'TONK-brief',
        }),
      };
    },
  },
  description: () =>
    `<p>U hebt een mail gekregen omdat u een verkeerde TONK-brief hebt ontvangen. Bekijk de mail voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const tonkProcessAlias =
  tozoRequestProcess as unknown as TONKRequestProcessLabels;

const besluitLabels: TONKRequestProcessLabels['besluit'] = {
  notification: {
    title: (requestProcess, statusStep) => {
      switch (statusStep?.decision) {
        case 'mogelijkeVerlenging':
          return `${requestProcess.title}: Er is een besluit over het wel of niet verlengen`;

        case 'verlenging':
          return `${requestProcess.title}: Uw uitkering is verlengd`;

        default:
          return tonkProcessAlias.besluit.notification.title(
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
          return tonkProcessAlias.besluit.notification.description(
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
        )}. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`;

      case 'verlenging':
        return `<p>U hebt recht op verlenging van ${productName(
          requestProcess,
          statusStep
        )}. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`;

      default:
        return tonkProcessAlias.besluit.description(requestProcess, statusStep);
    }
  },
};

export const requestProcess: TONKRequestProcessLabels = {
  aanvraag: tonkProcessAlias.aanvraag,
  herstelTermijn: tonkProcessAlias.herstelTermijn,
  besluit: besluitLabels,
  intrekking: tonkProcessAlias.intrekking,
  correctiemail: correctieMailLabels,
  briefWeigering: weigeringVerlengingLabels,
  link: (requestProcess) => ({
    to: generatePath(AppRoutes['INKOMEN/TONK'], {
      id: requestProcess.id,
    }),
    title: 'Meer informatie',
  }),
};
