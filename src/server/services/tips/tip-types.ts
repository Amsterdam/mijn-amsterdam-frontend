import { ApiResponse } from '../../../universal/helpers';
import { LinkProps } from '../../../universal/types';

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
  audience: TipAudience[];
  showOnUrls?: string[];
  description: string;
  predicates?: TipsPredicateFN[];
  reason?: string;
  isPersonalized: boolean;
  link: LinkProps;
  imgUrl: string;
  alwaysVisible?: boolean;
};

export type TipsPredicateFN = (
  stateData: Partial<ServiceResults>,
  today?: Date
) => boolean;

export type TipAudience = 'persoonlijk' | 'persoonlijk,zakelijk' | 'zakelijk';
