import {
  BELASTINGEN_ROUTE_DEFAULT,
  themaId,
  themaTitle,
  featureToggle,
} from './Belastingen-thema-config';
import { default as BelastingenIcon } from './BelastingenIcon.svg?react';
import { isLoading } from '../../../../universal/helpers/api';
import { type AppState } from '../../../../universal/types/App.types';
import { type ThemaMenuItem } from '../../../config/thema-types';

export const menuItem: ThemaMenuItem<typeof themaId> = {
  title: themaTitle,
  id: themaId,
  to: (appState: AppState) => {
    return appState.BELASTINGEN?.content?.url || BELASTINGEN_ROUTE_DEFAULT;
  },
  profileTypes: ['private', 'commercial'],
  isActive(appState: AppState) {
    return (
      featureToggle.belastingenActive &&
      !isLoading(appState.BELASTINGEN) &&
      !!appState.BELASTINGEN.content?.isKnown
    );
  },
  IconSVG: BelastingenIcon,
};
