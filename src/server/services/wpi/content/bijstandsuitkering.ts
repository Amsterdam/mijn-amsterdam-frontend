import { defaultDateFormat } from '../../../../universal/helpers/date';
import { createProcessNotification, isRequestProcessActual } from '../helpers';
import { WpiRequestProcess, WpiRequestProcessLabels } from '../wpi-types';

export const WpiExternalUrls = {
  BijstandsUitkeringAanvragenRechtenEnPlichten:
    'https://www.amsterdam.nl/werk-en-inkomen/bijstandsuitkering/rechten-plichten-regels/',
  BijstandsUitkeringAanvragen:
    'https://www.amsterdam.nl/werk-en-inkomen/bijstandsuitkering/bijstandsuitkering-aanvragen/',
  BetaalDataUitkering:
    'https://www.amsterdam.nl/werk-en-inkomen/bijstandsuitkering/uitbetaling-bijstandsuitkering/',
};

export const requestProcess: WpiRequestProcessLabels = {
  aanvraag: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij hebben uw aanvraag ontvangen`,
      description: (requestProcess) =>
        `Wij hebben uw aanvraag voor een bijstandsuitkering ontvangen op ${defaultDateFormat(
          requestProcess.dateStart
        )}.`,
    },
    description: (requestProcess) =>
      `
          <p>U heeft op ${defaultDateFormat(
            requestProcess.dateStart
          )} een bijstandsuitkering aangevraagd.</p>
          <p>
            <a
              href=${WpiExternalUrls.BijstandsUitkeringAanvragen}
              rel="external noopener noreferrer"
            >
              Wat kunt u van ons verwachten?
            </a>
          </p>
        `,
  },
  inBehandeling: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij behandelen uw aanvraag`,
      description: (requestProcess, statusStep) =>
        `Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op ${defaultDateFormat(
          statusStep.datePublished
        )}.`,
    },
    description: (requestProcess, statusStep) =>
      `
          <p>
            Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u
            nog extra informatie moet opsturen. U ontvangt vóór ${defaultDateFormat(
              statusStep.dateDecisionExpected
            )} ons besluit.
          </p>
          <p>
            Lees meer over uw
            <br />
            <a
              href=${
                WpiExternalUrls.BijstandsUitkeringAanvragenRechtenEnPlichten
              }
              class="ams-link
              rel="external noopener noreferrer"
            >
              rechten en plichten
            </a>
          </p>
        `,
  },
  herstelTermijn: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Meer informatie nodig`,
      description: (requestProcess) =>
        'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
    },
    description: (requestProcess, statusStep) =>
      `
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór ${defaultDateFormat(
              statusStep.dateUserFeedbackExpected
            )} opsturen. Dan ontvangt u
            vóór ${defaultDateFormat(
              statusStep.dateDecisionExpected
            )} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        `,
  },
  besluit: {
    notification: {
      title: (requestProcess) => {
        switch (requestProcess.decision) {
          case 'afwijzing':
            return `${requestProcess.title}: Uw aanvraag is afgewezen`;
          case 'toekenning':
            return `${requestProcess.title}: Uw aanvraag is toegekend`;
          case 'buitenBehandeling':
            return `${requestProcess.title}: Wij behandelen uw aanvraag niet meer`;
        }
        return `${requestProcess.title}: Besluit aanvraag`;
      },
      description: (requestProcess, statusStep) => {
        switch (requestProcess.decision) {
          case 'afwijzing':
            return `U heeft geen recht op een bijstandsuitkering (besluit ${defaultDateFormat(
              statusStep.datePublished
            )}).`;
          case 'toekenning':
            return `U heeft recht op een bijstandsuitkering (besluit ${defaultDateFormat(
              statusStep.datePublished
            )}).`;
          case 'buitenBehandeling':
            return `${requestProcess.title}: Wij behandelen uw aanvraag niet meer`;
        }

        return `Bekijk de brief voor meer details.`;
      },
    },
    description: (requestProcess) => {
      switch (requestProcess.decision) {
        case 'afwijzing':
          return 'U heeft geen recht op een bijstandsuitkering. Bekijk de brief voor meer details.';
        case 'toekenning':
          return `
            <p>
              U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer
              details.
            </p>
            <p>
              <a
                href=${WpiExternalUrls.BetaalDataUitkering}
                class="ams-link"
                rel="external noopener noreferrer"
              >
                Bekijk hier de betaaldata van de uitkering
              </a>
            </p>
          `;
        case 'buitenBehandeling':
          return 'Wij behandelen uw aanvraag niet meer. Bekijk de brief voor meer details.';
      }
      return `Wij hebben een besluit genomen over uw ${requestProcess.title} aanvraag.`;
    },
  },
};

export function getNotifications(
  bijstandsuitkeringAanvragen: WpiRequestProcess[]
) {
  const today = new Date();

  const aanvraagNotifications = bijstandsuitkeringAanvragen
    ?.filter((aanvraag) => {
      return isRequestProcessActual(aanvraag.datePublished, today);
    })
    .flatMap((aanvraag) =>
      aanvraag.steps.map((step) =>
        createProcessNotification(aanvraag, step, requestProcess)
      )
    );

  return aanvraagNotifications || [];
}
