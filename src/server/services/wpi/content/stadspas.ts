import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../../universal/config';
import { dateFormat, defaultDateFormat } from '../../../../universal/helpers';
import { MyNotification } from '../../../../universal/types';
import { createProcessNotification, isRequestProcessActual } from '../helpers';
import {
  WpiRequestProcess,
  WpiRequestProcessLabels,
  WpiStadspasResponseData,
} from '../wpi-types';

export const requestProcess: WpiRequestProcessLabels = {
  aanvraag: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij hebben uw aanvraag ontvangen`,
      description: (requestProcess, statusStep) =>
        `Wij hebben uw aanvraag voor een Stadspas ontvangen op ${defaultDateFormat(
          requestProcess.dateStart
        )}.`,
    },
    description: (requestProcess, statusStep) =>
      `U hebt op ${defaultDateFormat(
        statusStep.datePublished
      )} een Stadspas aangevraagd.`,
  },
  inBehandeling: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Wij behandelen uw aanvraag`,
      description: (requestProcess, statusStep) =>
        `Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op ${defaultDateFormat(
          statusStep.datePublished
        )}.`,
    },
    description: (product, statusStep) =>
      `
          <p>
            Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt
            vóór ${defaultDateFormat(
              statusStep.dateDecisionExpected
            )} ons besluit.
          </p>
          <p>
            <strong>
              Let op: Deze statusinformatie betreft alleen uw aanvraag voor een
              Stadspas.
            </strong>
            <br />
            Uw eventuele andere Hulp bij Laag Inkomen producten worden via post
            en/of telefoon afgehandeld.
          </p>
        `,
  },
  herstelTermijn: {
    notification: {
      title: (requestProcess) =>
        `${requestProcess.title}: Meer informatie nodig`,
      description: (requestProcess) =>
        'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
    },
    description: (product, statusStep) =>
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
            return `U hebt geen recht op een Stadspas (besluit ${defaultDateFormat(
              statusStep.datePublished
            )}).`;
          case 'toekenning':
            return `U hebt recht op een Stadspas (besluit ${defaultDateFormat(
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
          return `U hebt geen recht op een Stadspas. Bekijk de brief voor meer details.`;
        case 'toekenning':
          return 'U hebt recht op een Stadspas. Bekijk de brief voor meer details.';
        case 'buitenBehandeling':
          return 'Wij behandelen uw aanvraag niet meer. Bekijk de brief voor meer details.';
      }
      return `Wij hebben een besluit genomen over uw ${requestProcess.title} aanvraag.`;
    },
  },
};

const BUDGET_NOTIFICATION_DATE_START = `${new Date().getFullYear()}-05-01`;
const BUDGET_NOTIFICATION_DATE_END = `${new Date().getFullYear()}-07-31`;
const BUDGET_NOTIFICATION_BALANCE_THRESHOLD = 10;
const BUDGET_NOTIFICATION_PARENT = `
  Uw kind heeft nog een saldo van €${BUDGET_NOTIFICATION_BALANCE_THRESHOLD} of meer voor het kindtegoed.
  Het saldo vervalt op ${defaultDateFormat(BUDGET_NOTIFICATION_DATE_END)}.
  `;
const BUDGET_NOTIFICATION_CHILD = `
  Je hebt nog een saldo van €${BUDGET_NOTIFICATION_BALANCE_THRESHOLD} of meer voor het kindtegoed.
  Het saldo vervalt op ${defaultDateFormat(BUDGET_NOTIFICATION_DATE_END)}.
  `;

export function getAanvraagNotifications(
  stadspasAanvragen: WpiRequestProcess[]
) {
  const today = new Date();

  const aanvraagNotifications = stadspasAanvragen
    ?.filter((aanvraag) => {
      return isRequestProcessActual(aanvraag.datePublished, today);
    })
    .flatMap((aanvraag) =>
      aanvraag.steps.map((step) =>
        createProcessNotification(
          aanvraag,
          step,
          requestProcess,
          Chapters.STADSPAS
        )
      )
    );

  return aanvraagNotifications || [];
}

export function getBudgetNotifications(
  stadspassen: WpiStadspasResponseData['stadspassen']
) {
  const notifications: MyNotification[] = [];

  const createNotificationBudget = (
    description: string,
    stadspasId?: string
  ) => ({
    id: `stadspas-budget-notification`,
    datePublished: dateFormat(new Date(), 'yyyy-MM-dd'),
    chapter: Chapters.STADSPAS,
    title: `Stadspas kindtegoed: Maak je tegoed op voor ${defaultDateFormat(
      BUDGET_NOTIFICATION_DATE_END
    )}!`,
    description,
    link: {
      to: stadspasId
        ? generatePath(AppRoutes['STADSPAS/SALDO'], { id: stadspasId })
        : AppRoutes.STADSPAS,
      title: 'Check het saldo',
    },
  });

  const stadspas = stadspassen.find((stadspas) =>
    stadspas.budgets.some(
      (budget) => budget.budgetBalance >= BUDGET_NOTIFICATION_BALANCE_THRESHOLD
    )
  );

  const needsNotification = !!stadspas;
  const isParent = stadspassen.some(
    (pas) => pas.owner !== stadspassen[0].owner
  );
  const now = new Date();

  if (
    needsNotification &&
    now >= new Date(BUDGET_NOTIFICATION_DATE_START) &&
    now <= new Date(BUDGET_NOTIFICATION_DATE_END)
  ) {
    const notification = isParent
      ? createNotificationBudget(BUDGET_NOTIFICATION_PARENT)
      : createNotificationBudget(BUDGET_NOTIFICATION_CHILD, stadspas?.id);
    notifications.push(notification);
  }

  return notifications;
}
