import { useEffect } from 'react';

import {
  Heading,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

export type SectionProps = {
  title: string;
  listItems: ListItems;
};
type ListItems = Array<{ text: string; nested?: string[] }>;

const sections: SectionProps[] = [];

export function register(props: SectionProps) {
  sections.push(props);
}

function Section({ title, listItems }: SectionProps) {
  const listItemComponents = listItems.map((item, i) => (
    <UnorderedList.Item key={i}>
      {item.text}
      {item.nested && item.nested.length ? (
        <UnorderedList>
          {item.nested.map((nestedItem, j) => (
            <UnorderedList.Item key={j}>{nestedItem}</UnorderedList.Item>
          ))}
        </UnorderedList>
      ) : (
        ''
      )}
    </UnorderedList.Item>
  ));

  useEffect(() => {}, sections);
  return (
    <>
      <Heading level={4} size="level-4" className="ams-mb-s">
        {title}
      </Heading>
      <UnorderedList className="ams-mb-xl">{listItemComponents}</UnorderedList>
    </>
  );
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
          {sections.map((section) => (
            <Section
              key={section.title}
              title={section.title}
              listItems={section.listItems}
            />
          ))}
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
