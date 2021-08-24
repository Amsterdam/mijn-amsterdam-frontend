import { generatePath } from 'react-router-dom';
import { Chapters, IS_AP } from '../../../universal/config';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccesResult } from '../../../universal/helpers/api';
import { dateFormat, defaultDateFormat } from '../../../universal/helpers/date';
import { MyNotification } from '../../../universal/types/App.types';
import { fetchFOCUSCombined } from './focus-combined';

export interface FocusStadspasTransaction {
  id: string;
  title: string;
  amount: number;
  date: string;
}

export async function fetchStadspasSaldo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return apiSuccesResult(response.content.stadspassaldo || null);
  }

  return response;
}

export async function fetchStadspasSaldoGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const now = new Date();
  const BUDGET_NOTIFICATION_DATE_START = IS_AP ? '2021-04-14' : '2021-06-01';
  const BUDGET_NOTIFICATION_DATE_END =
    now > new Date('2021-08-31') ? '2022-07-31' : '2021-08-31';
  const BUDGET_NOTIFICATION_BALANCE_THRESHOLD = 10;
  const BUDGET_NOTIFICATION_PARENT = `
  Uw kind heeft nog een saldo van €${BUDGET_NOTIFICATION_BALANCE_THRESHOLD} of meer voor het kindtegoed.
  Het saldo vervalt op ${defaultDateFormat(BUDGET_NOTIFICATION_DATE_END)}.
  `;
  const BUDGET_NOTIFICATION_CHILD = `
  Je hebt nog een saldo van €${BUDGET_NOTIFICATION_BALANCE_THRESHOLD} of meer voor het kindtegoed.
  Het saldo vervalt op ${defaultDateFormat(BUDGET_NOTIFICATION_DATE_END)}.
  `;

  const createNotification = (description: string, stadspasId?: number) => ({
    id: `stadspas-budget-notification`,
    datePublished: dateFormat(new Date(), 'yyyy-MM-dd'),
    chapter: Chapters.STADSPAS,
    title: 'Stadspas kindtegoed: maak het saldo op',
    description,
    link: {
      to: stadspasId
        ? generatePath(AppRoutes['STADSPAS/SALDO'], { id: stadspasId })
        : AppRoutes.STADSPAS,
      title: 'Check het saldo',
    },
  });

  const FOCUS_STADSPAS = await fetchStadspasSaldo(
    sessionID,
    passthroughRequestHeaders
  );

  const notifications: MyNotification[] = [];

  if (FOCUS_STADSPAS.status === 'OK') {
    const stadspas = FOCUS_STADSPAS.content.stadspassen.find((stadspas) =>
      stadspas.budgets.some(
        (budget) => budget.balance >= BUDGET_NOTIFICATION_BALANCE_THRESHOLD
      )
    );
    const needsNotification = !!stadspas;
    const isParent = FOCUS_STADSPAS.content.type !== 'kind';
    const now = new Date();
    if (
      needsNotification &&
      now >= new Date(BUDGET_NOTIFICATION_DATE_START) &&
      now <= new Date(BUDGET_NOTIFICATION_DATE_END)
    ) {
      const notification = isParent
        ? createNotification(BUDGET_NOTIFICATION_PARENT)
        : createNotification(BUDGET_NOTIFICATION_CHILD, stadspas?.id);
      notifications.push(notification);
    }
  }

  return apiSuccesResult({
    notifications,
  });
}
