import React, { useContext } from 'react';
import Page, { PageContent, DetailPage } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './GarbageInformation.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { Chapters, ChapterTitles, ExternalUrls } from 'App.constants';
import Linkd from 'components/Button/Button';
import { AppContext } from 'AppState';
import Heading from 'components/Heading/Heading';

export default () => {
  const {
    GARBAGE: { data: items },
  } = useContext(AppContext);

  return (
    <DetailPage className={styles.GarbageInformation}>
      <PageHeading icon={<ChapterIcon chapter={Chapters.AFVAL} />}>
        {ChapterTitles.AFVAL}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder vindt u een overzicht van alle huis- en grofvuil
          voorzieningen.
        </p>
        <p>
          <Linkd href={ExternalUrls.HUISVUIL_VEELGEVRAAGD} external={true}>
            Veelgevraagd huisvuil
          </Linkd>
          <br />
          <Linkd href={ExternalUrls.AFVAL} external={true}>
            Regels voor grofvuil en hergebruik
          </Linkd>
        </p>
      </PageContent>
      {items.map(item => (
        <section className={styles.InfoSection}>
          <Heading size="mediumLarge">{item.title}</Heading>
          {!!item.aanbiedwijze && (
            <p>
              <strong>Aanbiedwijze</strong> <span>{item.aanbiedwijze}</span>
            </p>
          )}
          {!!item.ophaaldag && (
            <p>
              <strong>Ophaaldag</strong> <span>{item.ophaaldag}</span>
            </p>
          )}
        </section>
      ))}
    </DetailPage>
  );
};
