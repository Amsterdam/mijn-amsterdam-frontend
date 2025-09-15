import { Icon, Link } from '@amsterdam/design-system-react';
import {
  ChatBubbleIcon,
  EmailIcon,
  PhoneIcon,
} from '@amsterdam/design-system-react-icons';
import { generatePath, useParams } from 'react-router';

import { routeConfig } from '../Contact-thema-config';
import {
  contactmomentenDisplayProps,
  contactMomentenTitle,
  type ContactMomentFrontend,
} from './Contactmomenten-config';
import { mapperContactmomentToMenuItem } from './Contactmomenten-config';
import styles from './Contactmomenten.module.scss';
import { isError, isLoading } from '../../../../../universal/helpers/api';
import { MaRouterLink } from '../../../../components/MaLink/MaLink';
import type { ThemaMenuItemTransformed } from '../../../../config/thema-types';
import { getRedactedClass } from '../../../../helpers/cobrowse';
import { useAppStateGetter } from '../../../../hooks/useAppState';
import { useThemaMenuItems } from '../../../../hooks/useThemaMenuItems';
import { themaIdBRP } from '../../Profile/Profile-thema-config';

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

function addIcon(type: string) {
  const icons: Record<string, React.FC> = {
    Telefoon: PhoneIcon,
    Chat: ChatBubbleIcon,
    Contactformulier: EmailIcon,
  };
  if (icons[type]) {
    return (
      <span className={styles.IconWithLabel}>
        <Icon svg={icons[type]} size="heading-5" /> {type}
      </span>
    );
  }
  return type;
}

export function useContactmomenten() {
  const { CONTACT_MOMENTEN } = useAppStateGetter();
  const { items: myThemasMenuItems } = useThemaMenuItems();
  const routeParams = useParams();

  const contactmomenten: ContactMomentFrontend[] =
    CONTACT_MOMENTEN?.content?.map((contactMomentItem) => {
      const menuItemId =
        getMenuItem(contactMomentItem.subject, myThemasMenuItems)?.id ||
        contactMomentItem.subject;
      return {
        ...contactMomentItem,
        className: getRedactedClass(menuItemId),
        themaKanaalIcon: addIcon(contactMomentItem.themaKanaal),
        subjectLink: getLinkToThemaPage(
          contactMomentItem.subject,
          myThemasMenuItems
        ),
      };
    }) ?? [];

  return {
    contactmomenten,
    themaId: themaIdBRP,
    displayProps: contactmomentenDisplayProps,
    isError: isError(CONTACT_MOMENTEN),
    isLoading: isLoading(CONTACT_MOMENTEN),
    title: contactMomentenTitle,
    breadcrumbs: [],
    routeParams,
    listPageRoute: generatePath(routeConfig.listPageContactmomenten.path, {
      page: null,
    }),
  };
}
