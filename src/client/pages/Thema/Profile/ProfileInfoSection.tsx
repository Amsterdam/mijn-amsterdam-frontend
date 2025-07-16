import * as generalInfo from '../../GeneralInfo/GeneralInfo';

const profileSectionProps: generalInfo.SectionProps = {
  title: 'Mijn Gegevens',
  listItems: [
    { text: 'Uw inschrijving bij de gemeente' },
    { text: 'Uw contactmomenten met de gemeente' },
  ],
};

generalInfo.register(profileSectionProps);
