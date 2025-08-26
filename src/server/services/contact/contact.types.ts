export type MediumType = 'email' | 'phone' | 'postadres';

export type CommunicatieMedium = {
  type: MediumType;
  value: string | null;
};

export type CommunicatieMediumSetting = {
  type: MediumType;
  value: string | null;
};

export type Communicatievoorkeur = {
  id: string;
  stakeholder: string;
  description: string;
  settings: CommunicatieMediumSetting[];
};
