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
  isActive: boolean;
}[];

export const wpiAanvragenConfig: WpiAanvraagConfig = [
  {
    about: 'Bijstandsuitkering',
    labels: bijstandsuitkeringRequestProcessLabels,
    getNotifications: getBijstandsuitkeringNotifications,
    isActive: true,
  },
  {
    about: 'Bijzondere Bijstand',
    labels: bijzondereBijstandRequestProcessLabels,
    getNotifications: getBijzondereBijstandNotifications,
    isActive: featureToggle['INKOMEN.bijzondereBijstand'],
  },
];
