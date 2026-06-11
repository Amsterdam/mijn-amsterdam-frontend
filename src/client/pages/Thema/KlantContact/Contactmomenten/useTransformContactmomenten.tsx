import { Icon, Link } from '@amsterdam/design-system-react';
import {
  SpeechBalloonEllipsisIcon,
  MailIcon,
  PhoneIcon,
  PersonAtDeskIcon,
} from '@amsterdam/design-system-react-icons';

import type {
  ContactmomentFrontend,
  Kanaal,
} from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import type { ThemaMenuItemTransformed } from '../../../../config/thema-types.ts';
import { getRedactedClass } from '../../../../helpers/cobrowse.ts';
import { useActiveThemaMenuItems } from '../../../../hooks/useThemaMenuItems.ts';
import { themaConfig as themaAfis } from '../../Afis/Afis-thema-config.ts';
import { themaConfig as themaBelastingen } from '../../Belastingen/Belastingen-thema-config.ts';
import { themaConfig as themaInkomen } from '../../Inkomen/Inkomen-thema-config.ts';
import { themaConfig as themaKrefia } from '../../Krefia/Krefia-thema-config.ts';
import { themaConfig as themaParkeren } from '../../Parkeren/Parkeren-thema-config.ts';
import {
  featureToggle as featureToggleSvwi,
  themaId as themaIdSvwi,
} from '../../Svwi/Svwi-thema-config.ts';
import { themaConfig as themaZorg } from '../../Zorg/Zorg-thema-config.ts';
import type { ContactmomentFrontendFinal } from '../KlantContact-thema-config.ts';
import styles from './Contactmomenten.module.scss';

// TODO: Use all the individual thema ID's imported from the Thema Config files.
const SVWIv1ORv2 = featureToggleSvwi.svwiActive ? themaIdSvwi : themaInkomen.id;

export const mapperContactmomentToMenuItem = {
  Parkeren: themaParkeren.id,
  Zorg: themaZorg.id,
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: themaBelastingen.id,
  Geldzaken: themaKrefia.id,
  Financiën: themaAfis.id,
} as const;

function getMenuItem(
  onderwerp: string,
  myThemasMenuItems: ThemaMenuItemTransformed[]
) {
  return myThemasMenuItems.find(
    (item) =>
      item.id ===
      mapperContactmomentToMenuItem[
        onderwerp as keyof typeof mapperContactmomentToMenuItem
      ]
  );
}

function getLinkToThemaPage(
  onderwerp: string,
  myThemasMenuItems: ThemaMenuItemTransformed[]
) {
  const menuItem = getMenuItem(onderwerp, myThemasMenuItems);

  if (!menuItem) {
    return onderwerp;
  }

  // menuItem only exists in myThemasMenuItems if that thema is active through the toggle and this person has products in that thema.
  const LinkComponent = menuItem.to.startsWith('http') ? Link : MaRouterLink;

  return (
    <LinkComponent rel="noopener noreferrer" href={menuItem.to}>
      {menuItem.title}
    </LinkComponent>
  );
}

function addIcon(type: Kanaal) {
  const icons = {
    Telefoon: PhoneIcon,
    Chat: SpeechBalloonEllipsisIcon,
    Contactformulier: MailIcon,
    Stadsloket: PersonAtDeskIcon,
  } as const;
  if (icons[type]) {
    return (
      <span className={styles.IconWithLabel}>
        <Icon svg={icons[type]} size="heading-5" /> {type}
      </span>
    );
  }
  return type;
}

export function useTransformContactmomenten(
  contactmomenten: ContactmomentFrontend[]
): ContactmomentFrontendFinal[] {
  const { items: myThemasMenuItems } = useActiveThemaMenuItems();

  const contactmomenten_: ContactmomentFrontendFinal[] = contactmomenten.map(
    (contactmoment) => {
      const menuItemId = // getMenuItem can not be used because it is dependend on the user having the thema at the current moment
        mapperContactmomentToMenuItem[
          contactmoment.subject as keyof typeof mapperContactmomentToMenuItem
        ] || contactmoment.subject;
      return {
        ...contactmoment,
        className: getRedactedClass(menuItemId),
        kanaalEl: addIcon(contactmoment.kanaal),
        subjectLink: getLinkToThemaPage(
          contactmoment.subject,
          myThemasMenuItems
        ),
      };
    }
  );

  return contactmomenten_;
}
