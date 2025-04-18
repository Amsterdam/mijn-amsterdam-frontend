import { ApiResponse_DEPRECATED } from '../../../universal/helpers/api';
import { AppState, LinkProps } from '../../../universal/types';

export type ServiceResults = {
  [serviceId: string]: ApiResponse_DEPRECATED<any>;
};

export type ContentTipSource<ID extends string = string> = {
  active: boolean;
  alwaysVisible?: boolean;
  dateActiveEnd: string | null;
  dateActiveStart: string | null;
  datePublished: string;
  description: string;
  id: string;
  imgUrl?: string;
  // A tip that acts like a notification for better visibility.
  isNotification?: boolean;
  link: LinkProps;
  owner?: string;
  predicates?: TipsPredicateFN[];
  profileTypes: ProfileType[];
  reason?: string;
  themaID: ID;
  title: string;
};

export type TipsPredicateFN = (
  stateData: Partial<AppState>,
  today?: Date
) => boolean;
