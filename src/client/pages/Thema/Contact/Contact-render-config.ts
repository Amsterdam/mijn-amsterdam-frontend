import { ConnectedCirclesIcon } from '@amsterdam/design-system-react-icons';

import { AppointmentQRCodePage } from './AppointmentQRCodePage.tsx';
import { themaConfig } from './Contact-thema-config.ts';
import { ContactmomentenListPage } from './ContactmomentenListPage.tsx';
import { MijnContactThema } from './MijnContactThema.tsx';
import { isLoading } from '../../../../universal/helpers/api.ts';
import { type AppState } from '../../../../universal/types/App.types.ts';
import {
  type ThemaMenuItem,
  type ThemaRenderRouteConfig,
} from '../../../config/thema-types.ts';

export const ContactRoutes = [
  {
    route: themaConfig.route.path,
    Component: MijnContactThema,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.listPageContactmomenten.route.path,
    Component: ContactmomentenListPage,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: themaConfig.appointmentQRCode.route.path,
    Component: AppointmentQRCodePage,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ThemaRenderRouteConfig[];

export const menuItem: ThemaMenuItem = {
  title: themaConfig.title,
  id: themaConfig.id,
  to: themaConfig.route.path,
  profileTypes: themaConfig.profileTypes,
  redactedScope: themaConfig.redactedScope,
  isActive(appState: AppState) {
    return !!(
      themaConfig.featureToggle.active &&
      !isLoading(appState.KLANT_CONTACT) &&
      appState.KLANT_CONTACT.content &&
      Object.values(appState.KLANT_CONTACT.content).some((data) => data.length)
    );
  },
  IconSVG: ConnectedCirclesIcon,
};
