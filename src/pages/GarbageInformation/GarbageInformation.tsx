import React, { useContext } from 'react';
import Page, { PageContent, DetailPage } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './GarbageInformation.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { Chapters, ChapterTitles, ExternalUrls } from 'App.constants';
import Linkd from 'components/Button/Button';
import { AppContext } from 'AppState';
import Heading from 'components/Heading/Heading';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import { getFullAddress } from 'data-formatting/brp';
import classnames from 'classnames';

export default () => {
  const {
    BRP,
    GARBAGE: {
      isLoading,
      data: { wegbrengen, ophalen },
    },
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

      {ophalen.map((item, index) => (
        <SectionCollapsible
          key={item.title}
          className={styles.InfoSection}
          id="garbage-information"
          isLoading={isLoading}
          title={item.title}
          hasItems={!!ophalen.length}
          noItemsMessage="Informatie over afval in uw buurt kan niet worden getoond"
        >
          {index === 0 && (
            <>
              <div className={styles.Panel}>
                <Heading size="tiny">Uw adres</Heading>
                <p>{getFullAddress(BRP.data.adres)}</p>
              </div>
              <div className={styles.Panel}>
                <Heading size="tiny">Stadsdeel</Heading>
                <p>{item.stadsdeel}</p>
              </div>
            </>
          )}
          {!!item.aanbiedwijze && (
            <div className={styles.Panel}>
              <Heading size="tiny">Aanbiedwijze</Heading>
              <p>{item.aanbiedwijze}</p>
            </div>
          )}
          {!!item.ophaaldag && (
            <div className={styles.Panel}>
              <Heading size="tiny">Ophaaldag</Heading>
              <p>{item.ophaaldag}</p>
            </div>
          )}
        </SectionCollapsible>
      ))}

      <SectionCollapsible
        className={styles.InfoSection}
        id="diy-garbage-information"
        title="Afvalpunten voor bewoners en bedrijven"
      >
        <div className={classnames(styles.Panel, styles.AfvalPunten)}>
          <Heading size="tiny">Openingstijden</Heading>
          <p>
            De Afvalpunten zijn open van maandag tot en met zaterdag van 08.00
            tot 17.00 uur.
          </p>
          <p>
            <strong>Afvalpunt Henk Sneevlietweg ook op zondag open</strong>
            Het Afvalpunt op de Henk Sneevlietweg 22 is elke zondag van 10.00
            uur tot 16.00 uur open.
          </p>
        </div>
        {wegbrengen.map(item => (
          <div className={classnames(styles.Panel, styles.AfvalPunten)}>
            <Heading size="small">
              {item.naam} &mdash; {item.stadsdeel}
            </Heading>
            <p>{item.adres}</p>
            <p>
              Telefoon: <a href={`tel:${item.telefoon}`}>{item.telefoon}</a>
            </p>
          </div>
        ))}
      </SectionCollapsible>
    </DetailPage>
  );
};
