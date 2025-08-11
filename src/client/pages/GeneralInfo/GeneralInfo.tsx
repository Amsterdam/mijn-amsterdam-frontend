import {
  Heading,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import { MaLink, MaRouterLink } from '../../components/MaLink/MaLink';
import { myAreaSectionProps } from '../../components/MyArea/InfoSection';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useThemaMenuItemsByThemaID } from '../../hooks/useThemaMenuItems';
import { afisSectionProps } from '../Thema/Afis/InfoSection';
import { afvalSectionProps } from '../Thema/Afval/InfoSection';
import { AVGsectionProps } from '../Thema/AVG/InfoSection';
import { belastingenSectionProps } from '../Thema/Belastingen/InfoSection';
import { bezwarenSectionProps } from '../Thema/Bezwaren/InfoSection';
import { bodemsectionProps } from '../Thema/Bodem/InfoSection';
import { burgerzakenSectionProps } from '../Thema/Burgerzaken/InfoSection';
import { erfpachtSectionProps } from '../Thema/Erfpacht/InfoSection';
import {
  HLIRegelingenSectionProps,
  HLIstadspasSectionProps,
} from '../Thema/HLI/InfoSection';
import { inkomenSectionProps } from '../Thema/Inkomen/InfoSection';
import { klachtenSectionProps } from '../Thema/Klachten/InfoSection';
import { krefiaSectionProps } from '../Thema/Krefia/InfoSection';
import { milieuzonesectionProps } from '../Thema/Milieuzone/InfoSection';
import { overtredingensectionProps } from '../Thema/Overtredingen/InfoSection';
import { parkerensectionProps } from '../Thema/Parkeren/InfoSection';
import { profileSectionProps } from '../Thema/Profile/InfoSection';
import { subsidiesSectionProps } from '../Thema/Subsidies/InfoSection';
import { toeristischeverhuurSectionProps } from '../Thema/ToeristischeVerhuur/InfoSection';
import { vergunningensectionProps } from '../Thema/Vergunningen/InfoSection';
import { zorgSectionProps } from '../Thema/Zorg/InfoSection';

export type SectionProps = {
  id: string;
  title: string;
  to?: string; // Use this instead of the themaMenuItem 'to URL' and force link to be clickable.
  listItems: ListItems;
};
type ListItems = Array<{ text: string; listItems?: string[] }>;

const sections: SectionProps[] = [
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
  subsidiesSectionProps,
  krefiaSectionProps,
  toeristischeverhuurSectionProps,
  parkerensectionProps,
  milieuzonesectionProps,
  overtredingensectionProps,
  vergunningensectionProps,
  bodemsectionProps,
];

function Section({ id, title, listItems, to }: SectionProps) {
  const themaMenuItems = useThemaMenuItemsByThemaID();

  const listItemComponents = listItems.map((item, i) => (
    <UnorderedList.Item key={i}>
      {item.text}
      {!!item.listItems?.length && (
        <UnorderedList>
          {item.nested.map((nestedItem, j) => (
            <UnorderedList.Item key={j}>{nestedItem}</UnorderedList.Item>
          ))}
        </UnorderedList>
      )}
    </UnorderedList.Item>
  ));

  const themaMenuItem = themaMenuItems[id];

  const href = to || (themaMenuItem && themaMenuItem.to);
  const LinkComponent = getLinkComponent(href);
  const titleComponent = !LinkComponent ? (
    title
  ) : (
    <LinkComponent maVariant="fatNoUnderline" href={href}>
      {title}
    </LinkComponent>
  );

  return (
    <>
      <Heading level={4} size="level-4" className="ams-mb-s">
        {titleComponent}
      </Heading>
      <UnorderedList className="ams-mb-xl">{listItemComponents}</UnorderedList>
    </>
  );
}

function getLinkComponent(href: string) {
  if (!href) {
    return null;
  }
  if (href.startsWith('http')) {
    return MaLink;
  }
  return MaRouterLink;
}

export function GeneralInfo() {
  return (
    <TextPageV2>
      <PageContentV2 span={8}>
        <PageContentCell>
          <PageHeadingV2>Dit ziet u in Mijn Amsterdam</PageHeadingV2>
        </PageContentCell>
        <PageContentCell>
          <Paragraph className="ams-mb-m">
            Welkom op Mijn Amsterdam: dit is uw persoonlijke online portaal bij
            de gemeente Amsterdam.
          </Paragraph>
          <Paragraph className="ams-mb-m">
            Hier ziet u op 1 centrale plek welke gegevens de gemeente van u
            heeft vastgelegd. U ziet hier ook wat u bij de gemeente heeft
            aangevraagd, hoe het met uw aanvraag staat en hoe u kunt doorgeven
            als er iets niet klopt.
          </Paragraph>
          <Paragraph className="ams-mb-m">
            <b>Let op!</b> Een thema of een product verschijnt alléén als u deze
            ook heeft afgenomen!
          </Paragraph>
          <Paragraph className="ams-mb-xl">
            Op dit moment kunnen de volgende gegevens getoond worden:
          </Paragraph>
          {sections.map((section, i) => (
            <Section
              key={i}
              id={section.id}
              title={section.title}
              to={section.to}
              listItems={section.listItems}
            />
          ))}
          <Heading level={4} size="level-4" className="ams-mb-s">
            Vragen over Mijn Amsterdam
          </Heading>
          <Paragraph className="ams-mb-m">
            Kijk bij de{' '}
            <a
              href="https://www.amsterdam.nl/contact/mijn-amsterdam/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mijn Amsterdam - Veelgestelde vragen
            </a>
            .
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
