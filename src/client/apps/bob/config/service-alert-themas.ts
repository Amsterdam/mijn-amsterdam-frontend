import { themaId as myAreaThemaId } from '../../../components/MyArea/MyArea-thema-config.ts';
import { themaConfig as afisConfig } from '../pages/Thema/Afis/Afis-thema-config.ts';
import { themaConfig as afvalConfig } from '../pages/Thema/Afval/Afval-thema-config.ts';
import { themaConfig as avgConfig } from '../pages/Thema/AVG/AVG-thema-config.ts';
import { themaConfig as bezwarenConfig } from '../pages/Thema/Bezwaren/Bezwaren-thema-config.ts';
import { themaConfig as bodemConfig } from '../pages/Thema/Bodem/Bodem-thema-config.ts';
import { themaConfig as erfpachtConfig } from '../pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import { themaConfig as hliConfig } from '../pages/Thema/HLI/HLI-thema-config.ts';
import { themaConfig as horecaConfig } from '../pages/Thema/Horeca/Horeca-thema-config.ts';
import { themaConfig as inkomenConfig } from '../pages/Thema/Inkomen/Inkomen-thema-config.ts';
import { themaConfig as jeugdConfig } from '../pages/Thema/Jeugd/Jeugd-thema-config.ts';
import { themaConfig as klachtenConfig } from '../pages/Thema/Klachten/Klachten-thema-config.ts';
import { themaConfig as klantContactConfig } from '../pages/Thema/KlantContact/KlantContact-thema-config.ts';
import { themaConfig as krefiaConfig } from '../pages/Thema/Krefia/Krefia-thema-config.ts';
import { themaConfig as parkerenConfig } from '../pages/Thema/Parkeren/Parkeren-thema-config.ts';
import { themaConfig as profileConfig } from '../pages/Thema/Profile/Profile-thema-config.ts';
import { themaConfig as toeristischeVerhuurConfig } from '../pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import { themaConfig as varenConfig } from '../pages/Thema/Varen/Varen-thema-config.ts';
import { themaConfig as vergunningenConfig } from '../pages/Thema/Vergunningen/Vergunningen-thema-config.ts';
import { themaConfig as zorgConfig } from '../pages/Thema/Zorg/Zorg-thema-config.ts';

/**
 * The themas that have a page which renders theme alerts: every thema page that uses
 * ThemaPagina, the Afval thema page and Mijn buurt.
 * Themas without such a page can't show alerts and are not selectable.
 */
export const SERVICE_ALERT_THEMA_IDS = [
  afisConfig.id,
  afvalConfig.id,
  avgConfig.id,
  bezwarenConfig.id,
  bodemConfig.id,
  profileConfig.BRP.id,
  myAreaThemaId,
  erfpachtConfig.id,
  hliConfig.id,
  horecaConfig.id,
  inkomenConfig.id,
  jeugdConfig.id,
  klachtenConfig.id,
  klantContactConfig.id,
  krefiaConfig.id,
  profileConfig.KVK.id,
  parkerenConfig.id,
  toeristischeVerhuurConfig.id,
  varenConfig.id,
  vergunningenConfig.id,
  zorgConfig.id,
] as const;

export type ServiceAlertThemaID = (typeof SERVICE_ALERT_THEMA_IDS)[number];

export function isServiceAlertThemaID(
  themaID: unknown
): themaID is ServiceAlertThemaID {
  return SERVICE_ALERT_THEMA_IDS.includes(themaID as ServiceAlertThemaID);
}
