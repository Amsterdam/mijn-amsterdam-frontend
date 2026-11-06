import type { MyNotification } from '../../../universal/types/App.types.ts';
import { featureToggle } from '../../config/feature-toggles.ts';
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

const wpiAanvragen: WpiAanvraagConfig = [
  {
    about: 'Bijstandsuitkering',
    labels: bijstandsuitkeringRequestProcessLabels,
    getNotifications: getBijstandsuitkeringNotifications,
  },
  {
    about: 'Bijzondere Bijstand',
    labels: bijzondereBijstandRequestProcessLabels,
    getNotifications: getBijzondereBijstandNotifications,
  },
];

export function getWpiAanvragenConfig(): WpiAanvraagConfig {
  return featureToggle['INKOMEN.bijzondereBijstand']
    ? wpiAanvragen
    : wpiAanvragen.filter(
        (aanvraag) => aanvraag.about !== 'Bijzondere Bijstand'
      );
}

export function getAaanvraagConfig(aanvraagType: WpiRequestProcess['about']) {
  return getWpiAanvragenConfig().find(
    (aanvraag) => aanvraag.about === aanvraagType
  );
}
