import type { LinkProps } from '../../../universal/types/App.types';

export type MediumName = 'e-mail' | 'sms' | 'brieven per post';

export type CommunicatieMedium = {
  name: MediumName;
  value: string | null; // TODO: geraffineerder? bv e-mail + EmailAdres, sms + Telefoonnummer of brieven per post + PostAdres
  isActive: boolean;
  description?: string;
};

export type Communicatievoorkeur = {
  id: string;
  stakeholder: string;
  title: string;
  description: string;
  medium: CommunicatieMedium[];
  isActive: boolean;
  link: LinkProps;
};
