// import { linkListItems, tableConfig } from './config';

import { Icon, Link } from '@amsterdam/design-system-react';
import {
  ChatBubbleIcon,
  EmailIcon,
  PhoneIcon,
} from '@amsterdam/design-system-react-icons';
import { generatePath, useParams } from 'react-router';

import {
  contactmomentenDisplayProps,
  ContactMomentFrontend,
  mapperContactmomentToMenuItem,
} from './Contactmomenten.config';
import styles from './ProfilePrivate.module.scss';
import { isLoading, isError } from '../../../../../universal/helpers/api';
import { MaRouterLink } from '../../../../components/MaLink/MaLink';
import { ThemaMenuItemTransformed } from '../../../../config/thema-types';
import { useAppStateGetter } from '../../../../hooks/useAppState';
import {
  useThemaBreadcrumbs,
  useThemaMenuItems,
} from '../../../../hooks/useThemaMenuItems';
import { routeConfig, themaIdBRP } from '../Profile-thema-config';

function getLinkToThemaPage(
  onderwerp: string,
  myThemasMenuItems: ThemaMenuItemTransformed[]
) {
  const menuItem = myThemasMenuItems.find(
    (item) =>
      item.id ===
      mapperContactmomentToMenuItem[
        onderwerp as keyof typeof mapperContactmomentToMenuItem
      ]
  );

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
  const { KLANT_CONTACT } = useAppStateGetter();
  const { items: myThemasMenuItems } = useThemaMenuItems();
  const breadcrumbs = useThemaBreadcrumbs(themaIdBRP);
  const routeParams = useParams();

  const contactmomenten: ContactMomentFrontend[] =
    KLANT_CONTACT.content?.map((contactMomentItem) => {
      return {
        ...contactMomentItem,
        themaKanaalIcon: addIcon(contactMomentItem.themaKanaal),
        subjectLink: getLinkToThemaPage(
          contactMomentItem.subject,
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
    breadcrumbs,
    routeParams,
    listPageRoute: generatePath(routeConfig.listPageContactmomenten.path, {
      page: null,
    }),
  };
}
