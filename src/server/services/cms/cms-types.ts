import type {
  MyNotification,
  LinkProps,
} from '../../../universal/types/App.types';

type Tyd = {
  Nam: 'Starttijd' | 'Eindtijd';
  Tyd: string;
};
type Website = {
  Nam: 'Website';
  Src: string;
  Wrd: string;
};
type Dtm = {
  Nam: 'Einddatum' | 'Startdatum';
  Dtm: string;
};
type Wrd = {
  Nam: 'Locatie' | 'Toevoeging';
  Wrd: string;
};
type Src = {
  Nam: 'Meer informatie' | 'Omschrijving';
  Src: string;
};
export type CMSEventData = {
  item?: {
    relUrl: string;
    page?: {
      cluster: {
        veld: Array<Tyd | Website | Dtm | Src | Wrd>;
      };
      title: string;
    };
  };
};
export type CMSFeedItem = {
  title: string;
  content: string;
  feedid: string;
};
export type OtapEnv = 'tst' | 'acc' | 'prd' | 'dev' | 'unittest';
type SeverityLevel = 'error' | 'info' | 'success' | 'warning';
export type CMSMaintenanceNotification = MyNotification & {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  path: string;
  severity?: SeverityLevel;
  otapEnvs?: OtapEnv[];
  link?: LinkProps;
};
export type QueryParamsMaintenanceNotifications = {
  page?: string;
  forceRenew?: 'true';
};
