import { generatePath } from 'react-router';

import { StadspasFrontend } from './stadspas-types';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/HLI/HLI-thema-config';
import { dateFormat, defaultDateFormat } from '../../../universal/helpers/date';
import { MyNotification } from '../../../universal/types/App.types';

// The 31st of July is the default yearly expiry date for stadspassen.
// This date is chosen to active all new passes that are given out by Amsterdam.
export const DEFAULT_EXPIRY_DAY = '31';
export const DEFAULT_EXPIRY_MONTH = '07';

export const GPASS_API_TOKEN = process.env.BFF_GPASS_API_TOKEN;
export const GPASS_BUDGET_ONLY_FOR_CHILDREN = true;

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

export function getBudgetNotifications(stadspassen: StadspasFrontend[]) {
  const notifications: MyNotification[] = [];

  const createNotificationBudget = (
    description: string,
    stadspasPassNumber?: string
  ): MyNotification => ({
    id: `stadspas-budget-notification`,
    datePublished: dateFormat(new Date(), 'yyyy-MM-dd'),
    themaID: themaId,
    themaTitle: themaTitle,
    title: `Stadspas kindtegoed: Maak je tegoed op voor ${defaultDateFormat(
      BUDGET_NOTIFICATION_DATE_END
    )}!`,
    description,
    link: {
      to: stadspasPassNumber
        ? generatePath(routeConfig.detailPageStadspas.path, {
            passNumber: stadspasPassNumber,
          })
        : routeConfig.themaPage.path,
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
    (pas) =>
      pas.owner.initials !== stadspassen[0].owner.initials ||
      pas.owner.firstname !== stadspassen[0].owner.firstname
  );
  const now = new Date();

  if (
    needsNotification &&
    now >= new Date(BUDGET_NOTIFICATION_DATE_START) &&
    now <= new Date(BUDGET_NOTIFICATION_DATE_END)
  ) {
    const notification = isParent
      ? createNotificationBudget(BUDGET_NOTIFICATION_PARENT)
      : createNotificationBudget(
          BUDGET_NOTIFICATION_CHILD,
          stadspas?.passNumber.toString()
        );
    notifications.push(notification);
  }

  return notifications;
}
