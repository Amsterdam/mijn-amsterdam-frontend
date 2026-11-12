import { defaultDateFormat } from '../../../../universal/helpers/date.ts';
import {
  createProcessNotification,
  isRequestProcessActual,
} from '../helpers.ts';
import type {
  WpiRequestProcess,
  WpiRequestProcessLabels,
} from '../wpi-types.ts';

export const requestProcess: WpiRequestProcessLabels = {
  aanvraag: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij hebben uw aanvraag ontvangen`,
      description: (requestProcess) =>
        `Wij hebben uw aanvraag voor bijzondere bijstand ontvangen op ${defaultDateFormat(
          requestProcess.dateStart
        )}.`,
    },
    description: (requestProcess) =>
      `
        <p>U heeft op ${defaultDateFormat(
          requestProcess.dateStart
        )} bijzondere bijstand aangevraagd.</p>
      `,
  },
  inBehandeling: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij behandelen uw aanvraag`,
      description: (_requestProcess, statusStep) =>
        `Wij hebben uw aanvraag voor bijzondere bijstand in behandeling genomen op ${defaultDateFormat(
          statusStep.datePublished
        )}.`,
    },
    description: (_requestProcess, statusStep) =>
      `
        <p>
          Wij hebben uw aanvraag voor bijzondere bijstand in behandeling genomen.
          Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt vóór ${defaultDateFormat(
            statusStep.dateDecisionExpected
          )} ons besluit.
        </p>
      `,
  },
  herstelTermijn: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Meer informatie nodig`,
      description: () =>
        'Er is meer informatie en tijd nodig om uw aanvraag voor bijzondere bijstand te behandelen.',
    },
    description: (_requestProcess, statusStep) =>
      `
        <p>
          Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken.
          U moet de extra informatie vóór ${defaultDateFormat(
            statusStep.dateUserFeedbackExpected
          )} opsturen. Dan ontvangt u vóór ${defaultDateFormat(
            statusStep.dateDecisionExpected
          )} ons besluit.
        </p>
        <p>
          Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in.
          Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij
          verder kunnen met de behandeling van uw aanvraag.
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
            return `U heeft geen recht op bijzondere bijstand (besluit ${defaultDateFormat(
              statusStep.datePublished
            )}).`;
          case 'toekenning':
            return `U heeft recht op bijzondere bijstand (besluit ${defaultDateFormat(
              statusStep.datePublished
            )}).`;
          case 'buitenBehandeling':
            return `${requestProcess.title}: Wij behandelen uw aanvraag niet meer`;
        }

        return 'Er is een besluit genomen over uw aanvraag voor bijzondere bijstand.';
      },
    },
    description: (requestProcess) => {
      switch (requestProcess.decision) {
        case 'afwijzing':
          return 'U heeft geen recht op bijzondere bijstand.';
        case 'toekenning':
          return `
            <p>
              U heeft recht op bijzondere bijstand.
            </p>
          `;
        case 'buitenBehandeling':
          return 'Wij behandelen uw aanvraag niet meer.';
      }
      return `Wij hebben een besluit genomen over uw ${requestProcess.title} aanvraag.`;
    },
  },
};

export function getNotifications(
  bijzondereBijstandAanvragen: WpiRequestProcess[]
) {
  const today = new Date();

  const aanvraagNotifications = bijzondereBijstandAanvragen
    .filter((aanvraag) => {
      return (
        !!aanvraag?.datePublished &&
        isRequestProcessActual(aanvraag.datePublished, today)
      );
    })
    .flatMap((aanvraag) =>
      aanvraag.steps.map((step) =>
        createProcessNotification(aanvraag, step, requestProcess)
      )
    );

  return aanvraagNotifications;
}
