// import { linkListItems, tableConfig } from './config';

import { Icon } from '@amsterdam/design-system-react';
import {
  ChatBubbleIcon,
  EmailIcon,
  PhoneIcon,
} from '@amsterdam/design-system-react-icons';

import {
  contactmomentenDisplayProps,
  mapperContactmomentToMenuItem,
} from './config';
import styles from './Profile.module.scss';
import { isLoading, isError } from '../../../universal/helpers/api';
import { LinkdInline } from '../../components';
import { ThemaMenuItemTransformed } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';

function getLinkToThemaPage(
  onderwerp: string,
  myThemasMenuItems: ThemaMenuItemTransformed[]
) {
  const menuItem = myThemasMenuItems.find(
    (item) => item.id === mapperContactmomentToMenuItem[onderwerp as string]
  );

  // menuItem only exists in myThemasMenuItems if that thema is active through the toggle and this person has products in that thema.
  if (menuItem) {
    return (
      <LinkdInline external={menuItem.to.startsWith('http')} href={menuItem.to}>
        {menuItem.title}
      </LinkdInline>
    );
  }

  return onderwerp;
}

function addIcon(type: string) {
  const icons: Record<string, React.FC> = {
    Telefoon: PhoneIcon,
    Chat: ChatBubbleIcon,
    Contactformulier: EmailIcon,
  };
  if (icons[type]) {
    return (
      <span className={styles.IconWithLabel}>
        <Icon svg={icons[type]} size="level-5" /> {type}
      </span>
    );
  }
  return type;
}

export function useContactmomenten() {
  const { KLANT_CONTACT } = useAppStateGetter();
  const { items: myThemasMenuItems } = useThemaMenuItems();

  const contactmomenten =
    KLANT_CONTACT.content?.map?.((contactMomentItem) => {
      return {
        ...contactMomentItem,
        kanaal: addIcon(contactMomentItem.kanaal),
        onderwerp: getLinkToThemaPage(
          contactMomentItem.onderwerp,
          myThemasMenuItems
        ),
      };
    }) ?? [];

  return {
    contactmomenten,
    displayProps: contactmomentenDisplayProps,
    isError: isError(KLANT_CONTACT),
    isLoading: isLoading(KLANT_CONTACT),
    title: 'Contactmomenten',
  };
}
