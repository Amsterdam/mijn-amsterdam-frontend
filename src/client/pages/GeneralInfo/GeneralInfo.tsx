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
import { AVGsectionProps } from '../Thema/AVG/InfoSection';
import { belastingenSectionProps } from '../Thema/Belastingen/InfoSection';
import { bezwarenSectionProps } from '../Thema/Bezwaren/InfoSection';
import { themaConfig as bodemThemaConfig } from '../Thema/Bodem/Bodem-thema-config';
import { burgerzakenSectionProps } from '../Thema/Burgerzaken/InfoSection';
import { erfpachtSectionProps } from '../Thema/Erfpacht/InfoSection';
import {
  HLIRegelingenSectionProps,
  HLIstadspasSectionProps,
} from '../Thema/HLI/InfoSection';
import { inkomenSectionProps } from '../Thema/Inkomen/InfoSection';
import { JeugdSectionProps as jeugdSectionProps } from '../Thema/Jeugd/InfoSection';
import { klachtenSectionProps } from '../Thema/Klachten/InfoSection';
import { krefiaSectionProps } from '../Thema/Krefia/InfoSection';
import { milieuzonesectionProps } from '../Thema/Milieuzone/InfoSection';
import { overtredingensectionProps } from '../Thema/Overtredingen/InfoSection';
import { parkerensectionProps } from '../Thema/Parkeren/InfoSection';
import { profileSectionProps } from '../Thema/Profile/InfoSection';
import { subsidiesSectionProps } from '../Thema/Subsidies/InfoSection';
import { toeristischeverhuurSectionProps } from '../Thema/ToeristischeVerhuur/InfoSection';
import { varensectionProps } from '../Thema/Varen/infoSection';
import { vergunningensectionProps } from '../Thema/Vergunningen/InfoSection';
import { zorgSectionProps } from '../Thema/Zorg/InfoSection';

export type InfoSection_DEPRECATED = {
  id: string;
  title: string;
  href?: string; // Use this instead of the themaMenuItem 'to URL' and force link to be clickable.
  listItems: InfoSection['listItems'];
  active: boolean;
};

function createDeprecatedInfoSection(
  themaConfig: ThemaConfigBase
): InfoSection_DEPRECATED {
  return {
    id: themaConfig.id,
    active: themaConfig.featureToggle.themaActive,
    title: themaConfig.uitlegPageSections.title,
    listItems: themaConfig.uitlegPageSections.listItems,
  };
}

export type SectionProps = {
  title: string;
  href?: string;
  listItems: InfoSection['listItems'];
};

const sections: InfoSection_DEPRECATED[] = [
  profileSectionProps,
  burgerzakenSectionProps,
  myAreaSectionProps,
  afvalSectionProps,
  belastingenSectionProps,
  AVGsectionProps,
  bezwarenSectionProps,
  klachtenSectionProps,
  erfpachtSectionProps,
  afisSectionProps,
  inkomenSectionProps,
  HLIRegelingenSectionProps,
  HLIstadspasSectionProps,
  zorgSectionProps,
  jeugdSectionProps,
  subsidiesSectionProps,
  krefiaSectionProps,
  toeristischeverhuurSectionProps,
  parkerensectionProps,
  milieuzonesectionProps,
  overtredingensectionProps,
  vergunningensectionProps,
  createDeprecatedInfoSection(bodemThemaConfig),
  varensectionProps,
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
    <PageV2 heading="Dit ziet u in Mijn Amsterdam">
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
