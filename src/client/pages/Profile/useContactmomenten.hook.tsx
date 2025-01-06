// import { linkListItems, tableConfig } from './config';
import { Icon } from '@amsterdam/design-system-react';
import {
  ChatBubbleIcon,
  EmailIcon,
  PhoneIcon,
} from '@amsterdam/design-system-react-icons';

import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { Themas, Thema } from '../../../universal/config/thema';
import { isLoading, isError } from '../../../universal/helpers/api';
import { LinkdInline } from '../../components';
import { ThemaMenuItem } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';

function getLinkToThemaPage(
  onderwerp: string,
  myThemasMenuItems: ThemaMenuItem[]
) {
  const erfpachtV1ORV2 = FeatureToggle.erfpachtV2Active
    ? Themas.ERFPACHTv2
    : Themas.ERFPACHT;

  const SVWIv1ORv2 = FeatureToggle.svwiLinkActive
    ? Themas.SVWI
    : Themas.INKOMEN;

  const mapperContactmomentToMenuItem: Record<string, Thema> = {
    Erfpacht: erfpachtV1ORV2,
    Parkeren: Themas.PARKEREN,
    Zorg: Themas.ZORG,
    'Werk en Inkomen': SVWIv1ORv2,
    Belastingen: Themas.BELASTINGEN,
    Geldzaken: Themas.KREFIA,
    Financieen: Themas.AFIS,
  };

  const menuItem = myThemasMenuItems.find(
    (item) => item.id === mapperContactmomentToMenuItem[onderwerp as string]
  );
  // menuItem only exists in myThemasMenuItems if that thema is active through the toggle and this person has products in that thema.
  if (menuItem) {
    return (
      <LinkdInline
        external={(menuItem.to as string).startsWith('http') ? true : false}
        href={menuItem.to as string}
      >
        {menuItem.title as string}
      </LinkdInline>
    );
  } else return onderwerp;
}

function addIcon(type: string) {
  if (type == 'Telefoon') {
    return (
      <div>
        {' '}
        <Icon svg={PhoneIcon} size="level-5" /> {type}
      </div>
    );
  }
  if (type == 'Chat') {
    return (
      <div>
        {' '}
        <Icon svg={ChatBubbleIcon} size="level-5" /> {type}
      </div>
    );
  }
  if (type == 'Contactformulier') {
    return (
      <div>
        {' '}
        <Icon svg={EmailIcon} size="level-5" /> {type}
      </div>
    );
  } else return type;
}

export function useContactmomenten() {
  const { SALESFORCE } = useAppStateGetter();
  const { items: myThemasMenuItems } = useThemaMenuItems();

  const items =
    SALESFORCE.content != null
      ? SALESFORCE.content.map((contactMomentItem) => {
          return {
            ...contactMomentItem,
            kanaal: addIcon(contactMomentItem.kanaal),
            onderwerp: getLinkToThemaPage(
              contactMomentItem.onderwerp,
              myThemasMenuItems
            ),
          };
        })
      : [];

  return {
    isLoading: isLoading(SALESFORCE),
    isError: isError(SALESFORCE),
    items,
  };
}
