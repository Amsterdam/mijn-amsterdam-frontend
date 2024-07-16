import { Thema } from '../../../universal/config/thema';
import { ApiResponse } from '../../../universal/helpers/api';
import { AppState, LinkProps } from '../../../universal/types';

export type ServiceResults = { [serviceId: string]: ApiResponse<any> };

export type Tip = {
  id: string;
  owner?: string;
  dateActiveStart: string | null;
  dateActiveEnd: string | null;
  active: boolean;
  priority: number;
  datePublished: string;
  title: string;
  profileTypes: ProfileType[];
  description: string;
  predicates?: TipsPredicateFN[];
  reason?: string;
  link: LinkProps;
  imgUrl?: string;
  alwaysVisible?: boolean;
  isNotification?: boolean;
  thema?: Thema;
};

export type TipsPredicateFN = (
  stateData: Partial<AppState>,
  today?: Date
) => boolean;
