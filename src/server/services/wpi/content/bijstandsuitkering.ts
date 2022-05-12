import { Chapters } from '../../../../universal/config';
import { defaultDateFormat } from '../../../../universal/helpers';
import { createProcessNotification, isRequestProcessActual } from '../helpers';
import { WpiRequestProcess, WpiRequestProcessLabels } from '../wpi-types';

export const WpiExternalUrls = {
  BijstandsUitkeringAanvragenRechten:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d',
  BijstandsUitkeringAanvragenPlichten:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d',
  BijstandsUitkeringAanvragen:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D',
  BetaalDataUitkering:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D',
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
          <p>U hebt op ${defaultDateFormat(
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
      description: (requestProcess) =>
        `Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op ${defaultDateFormat(
          requestProcess.datePublished
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
              href=${WpiExternalUrls.BijstandsUitkeringAanvragenRechten}
              rel="external noopener noreferrer"
            >
              rechten
            </a> en <a
              href=${WpiExternalUrls.BijstandsUitkeringAanvragenPlichten}
              rel="external noopener noreferrer"
            >
              plichten
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
      description: (requestProcess) => {
        switch (requestProcess.decision) {
          case 'afwijzing':
            return `U hebt geen recht op een bijstandsuitkering (besluit ${defaultDateFormat(
              requestProcess.datePublished
            )}).`;
          case 'toekenning':
            return `U hebt recht op een bijstandsuitkering (besluit ${defaultDateFormat(
              requestProcess.datePublished
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
          return 'U hebt geen recht op een bijstandsuitkering. Bekijk de brief voor meer details.';
        case 'toekenning':
          return `
            <p>
              U hebt recht op een bijstandsuitkering. Bekijk de brief voor meer
              details.
            </p>
            <p>
              <a
                href=${WpiExternalUrls.BetaalDataUitkering}
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
        createProcessNotification(
          aanvraag,
          step,
          requestProcess,
          Chapters.INKOMEN
        )
      )
    );

  return aanvraagNotifications || [];
}
