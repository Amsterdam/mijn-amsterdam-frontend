import {
  Heading,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import { MaLink, MaRouterLink } from '../../components/MaLink/MaLink';
import { myAreaSectionProps } from '../../components/MyArea/InfoSection';
import { PageContentCell, PageV2 } from '../../components/Page/Page';
import { ThemaConfigBase, InfoSection } from '../../config/thema-types';
import { getRedactedClass } from '../../helpers/cobrowse';
import {
  compareThemas,
  useAllThemaMenuItemsByThemaID,
} from '../../hooks/useThemaMenuItems';
import { afisSectionProps } from '../Thema/Afis/InfoSection';
import { afvalSectionProps } from '../Thema/Afval/InfoSection';
import { themaConfig as avgThemaConfig } from '../Thema/AVG/AVG-thema-config';
import { themaConfig as belastingenThemaConfig } from '../Thema/Belastingen/Belastingen-thema-config';
import { themaConfig as bezwarenThemaConfig } from '../Thema/Bezwaren/Bezwaren-thema-config';
import { themaConfig as bodemThemaConfig } from '../Thema/Bodem/Bodem-thema-config';
import { themaConfig as erfpachtThemaConfig } from '../Thema/Erfpacht/Erfpacht-thema-config';
import { themaConfig as hliThemaConfig } from '../Thema/HLI/HLI-thema-config';
import { inkomenSectionProps } from '../Thema/Inkomen/InfoSection';
import { themaConfig as jeugdThemaConfig } from '../Thema/Jeugd/Jeugd-thema-config';
import { themaConfig as klachtenThemaConfig } from '../Thema/Klachten/Klachten-thema-config';
import { krefiaSectionProps } from '../Thema/Krefia/InfoSection';
import { milieuzonesectionProps } from '../Thema/Milieuzone/InfoSection';
import { overtredingensectionProps } from '../Thema/Overtredingen/InfoSection';
import { parkerensectionProps } from '../Thema/Parkeren/InfoSection';
import { profileSectionProps } from '../Thema/Profile/InfoSection';
import { themaConfig as subsidiesThemaConfig } from '../Thema/Subsidies/Subsidies-thema-config';
import { themaConfig as toeristischeVerhuurThemaConfig } from '../Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import { varensectionProps } from '../Thema/Varen/infoSection';
import { vergunningensectionProps } from '../Thema/Vergunningen/InfoSection';
import { themaConfig as zorgThemaConfig } from '../Thema/Zorg/Zorg-thema-config';

export type InfoSection_DEPRECATED = {
  id: string;
  title: string;
  href?: string; // Use this instead of the themaMenuItem 'to URL' and force link to be clickable.
  listItems: InfoSection['listItems'];
  active: boolean;
};

function createDeprecatedInfoSection(
  themaConfig: ThemaConfigBase
): InfoSection_DEPRECATED[] {
  return themaConfig.uitlegPageSections.map((section) => {
    return {
      id: themaConfig.id,
      active: themaConfig.featureToggle.active,
      title: section.title,
      listItems: section.listItems,
    };
  });
}

export type SectionProps = {
  title: string;
  href?: string;
  listItems: InfoSection['listItems'];
};

const sections: InfoSection_DEPRECATED[] = [
  profileSectionProps,
  myAreaSectionProps,
  afvalSectionProps,
  afisSectionProps,
  inkomenSectionProps,
  vergunningensectionProps,
  krefiaSectionProps,
  parkerensectionProps,
  milieuzonesectionProps,
  overtredingensectionProps,
  varensectionProps,
  ...createDeprecatedInfoSection(avgThemaConfig),
  ...createDeprecatedInfoSection(belastingenThemaConfig),
  ...createDeprecatedInfoSection(bezwarenThemaConfig),
  ...createDeprecatedInfoSection(bodemThemaConfig),
  ...createDeprecatedInfoSection(erfpachtThemaConfig),
  ...createDeprecatedInfoSection(hliThemaConfig),
  ...createDeprecatedInfoSection(jeugdThemaConfig),
  ...createDeprecatedInfoSection(klachtenThemaConfig),
  ...createDeprecatedInfoSection(subsidiesThemaConfig),
  ...createDeprecatedInfoSection(toeristischeVerhuurThemaConfig),
  ...createDeprecatedInfoSection(zorgThemaConfig),
];

function InfoPageSection({ title, listItems, href }: SectionProps) {
  const listItemComponents = listItems.map((item, i) => {
    if (typeof item === 'string') {
      return <UnorderedList.Item key={i}>{item}</UnorderedList.Item>;
    }
    return (
      <UnorderedList.Item key={i}>
        {item.text}
        {!!item.listItems?.length && (
          <UnorderedList>
            {item.listItems.map((nestedItem, j) => (
              <UnorderedList.Item key={j}>{nestedItem}</UnorderedList.Item>
            ))}
          </UnorderedList>
        )}
      </UnorderedList.Item>
    );
  });

  const LinkComponent = href && getLinkComponent(href);

  const titleComponent = LinkComponent ? (
    <LinkComponent maVariant="fatNoUnderline" href={href}>
      {title}
    </LinkComponent>
  ) : (
    title
  );

  return (
    <>
      <Heading level={3} className="ams-mb-s">
        {titleComponent}
      </Heading>
      <UnorderedList className="ams-mb-l">{listItemComponents}</UnorderedList>
    </>
  );
}

function getLinkComponent(href: string) {
  if (!href) {
    return null;
  }
  if (href.startsWith('http')) {
    // Prevent external URLS from being fully concatenated in the path as would happen with MaRouterLink.
    return MaLink;
  }
  return MaRouterLink;
}

export function GeneralInfo() {
  const themaMenuItems = useAllThemaMenuItemsByThemaID();
  const sectionComponents = sections
    .filter((section) => {
      return section.active && section.id in themaMenuItems;
    })
    .toSorted(compareThemas)
    .map((section, i) => {
      const themaMenuItem = themaMenuItems[section.id];
      section.href = section.href || (themaMenuItem && themaMenuItem.to);

      return (
        <InfoPageSection
          key={i}
          title={section.title}
          href={themaMenuItem.isActive ? section.href : undefined}
          listItems={section.listItems}
        />
      );
    });
  return (
    <PageV2
      heading="Dit ziet u in Mijn Amsterdam"
      redactedScope="full"
      showUserFeedback
      userFeedbackDetails={{
        pageTitle: 'Uitleg',
      }}
    >
      <PageContentCell>
        <Paragraph className="ams-mb-m">
          Welkom op Mijn Amsterdam: dit is uw persoonlijke online portaal bij de
          gemeente Amsterdam.
        </Paragraph>
        <Paragraph className="ams-mb-m">
          Hier ziet u op 1 centrale plek welke gegevens de gemeente van u heeft
          vastgelegd. U ziet hier ook wat u bij de gemeente heeft aangevraagd,
          hoe het met uw aanvraag staat en hoe u kunt doorgeven als er iets niet
          klopt.
        </Paragraph>
        <Paragraph className="ams-mb-m">
          <strong>Let op!</strong> Een thema of een product verschijnt alléén
          als u deze ook heeft afgenomen!
        </Paragraph>
        <Paragraph className="ams-mb-xl">
          Op dit moment kunnen de volgende gegevens getoond worden:
        </Paragraph>
        <div className={getRedactedClass()}>{sectionComponents}</div>
        <Heading level={4} className="ams-mb-s">
          Vragen over Mijn Amsterdam
        </Heading>
        <Paragraph className="ams-mb-m">
          Kijk bij de{' '}
          <a
            href="https://www.amsterdam.nl/contact/mijn-amsterdam/"
            rel="external"
          >
            Mijn Amsterdam - Veelgestelde vragen
          </a>
          .
        </Paragraph>
      </PageContentCell>
    </PageV2>
  );
}
