import type { MyNotification } from '../../../universal/types/App.types.ts';
import {
  requestProcess as bijstandsuitkeringRequestProcessLabels,
  getNotifications as getBijstandsuitkeringNotifications,
} from './content/bijstandsuitkering.ts';
import {
  requestProcess as bijzondereBijstandRequestProcessLabels,
  getNotifications as getBijzondereBijstandNotifications,
} from './content/bijzondere-bijstand.ts';
import type {
  WpiRequestProcess,
  WpiRequestProcessLabels,
} from './wpi-types.ts';

type WpiAanvraagConfig = {
  about: WpiRequestProcess['about'];
  labels: WpiRequestProcessLabels;
  getNotifications: (
    bijstandsuitkeringAanvragen: WpiRequestProcess[]
  ) => MyNotification<string>[];
}[];

export const wpiAanvragen: WpiAanvraagConfig = [
  {
    about: 'Bijstandsuitkering',
    labels: bijstandsuitkeringRequestProcessLabels,
    getNotifications: getBijstandsuitkeringNotifications,
  },
  {
    about: 'Bijzondere bijstand',
    labels: bijzondereBijstandRequestProcessLabels,
    getNotifications: getBijzondereBijstandNotifications,
  },
];

export function getAaanvraagConfig(aanvraagType: WpiRequestProcess['about']) {
  return wpiAanvragen.find((aanvraag) => aanvraag.about === aanvraagType);
}
