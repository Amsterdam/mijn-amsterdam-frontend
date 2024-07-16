import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ZorgDetail from './ZorgDetail';

const testState: any = {
  WMO: {
    status: 'OK',
    content: [
      {
        id: 'wmo-item-1',
        title: 'Wmo item 1',
        supplier: 'Mantelzorg B.V',
        isActual: true,
        link: {
          to: 'http://example.org/ding',
          title: 'Linkje!! naar wmo item 1',
        },
        steps: [
          {
            id: 'wmo-step-1',
            status: 'Levering gestart',
            datePublished: '2020-07-24',
            description: 'De levering van uw thuizorg is gestart',
            documents: [],
            isActive: true,
            isChecked: true,
          },
        ],
      },
      {
        id: '102996420',
        title: 'Hulp bij het huishouden (nog niet geleverd)',
        dateStart: '15 januari 2022',
        dateEnd: '',
        supplier: 'Emile Thuiszorg',
        isActual: true,
        link: {
          title: 'Meer informatie',
          to: '/zorg-en-ondersteuning/voorzieningen/102996420',
        },
        steps: [
          {
            id: 'status-step-0',
            status: 'Besluit',
            description:
              '\n              <p>\n                U heeft recht op hulp bij het huishouden (nog niet geleverd) per 15 januari 2022.\n              </p>\n              <p>\n                \n                    In de brief leest u ook hoe u bezwaar kunt maken, een klacht\n                    kan indienen of <u>hoe u van aanbieder kunt wisselen.</u>\n                  \n              </p>\n            ',
            datePublished: '2022-01-15',
            isActive: true,
            isChecked: true,
            documents: [],
            altDocumentContent:
              '<p>\n            <strong>\n              U krijgt dit besluit per post.\n            </strong>\n          </p>',
          },
          {
            id: 'status-step-1',
            status: 'Levering gestart',
            description:
              '<p>\n            Emile Thuiszorg is gestart met het leveren van hulp bij het huishouden (nog niet geleverd).\n          </p>',
            datePublished: '',
            isActive: false,
            isChecked: false,
            documents: [],
          },
          {
            id: 'status-step-2',
            status: 'Levering gestopt',
            description:
              '<p>\n            Niet van toepassing.\n          </p>',
            datePublished: '',
            isActive: false,
            isChecked: false,
            documents: [],
          },
          {
            id: 'status-step-3',
            status: 'Einde recht',
            description:
              '<p>\n            Uw recht op hulp bij het huishouden (nog niet geleverd) is beëindigd per \n          </p>',
            datePublished: null,
            isActive: false,
            isChecked: false,
            documents: [],
          },
        ],
        voorzieningsoortcode: 'WMH',
      },
      {
        id: '3917854581',
        title: 'Hulp bij het huishouden (geleverd)',
        dateStart: '15 december 2021',
        dateEnd: '',
        supplier: 'Emile Thuiszorg',
        isActual: true,
        link: {
          title: 'Meer informatie',
          to: '/zorg-en-ondersteuning/voorzieningen/3917854581',
        },
        steps: [
          {
            id: 'status-step-0',
            status: 'Besluit',
            description:
              '\n              <p>\n                U heeft recht op hulp bij het huishouden (geleverd) per 15 december 2021.\n              </p>\n              <p>\n                \n                    In de brief leest u ook hoe u bezwaar kunt maken, een klacht\n                    kan indienen of <u>hoe u van aanbieder kunt wisselen.</u>\n                  \n              </p>\n            ',
            datePublished: '2022-01-15',
            isActive: false,
            isChecked: true,
            documents: [],
            altDocumentContent:
              '<p>\n            <strong>\n              U krijgt dit besluit per post.\n            </strong>\n          </p>',
          },
          {
            id: 'status-step-1',
            status: 'Levering gestart',
            description:
              '<p>\n            Emile Thuiszorg is gestart met het leveren van hulp bij het huishouden (geleverd).\n          </p>',
            datePublished: '',
            isActive: true,
            isChecked: true,
            documents: [],
          },
          {
            id: 'status-step-2',
            status: 'Levering gestopt',
            description:
              '<p>\n            Niet van toepassing.\n          </p>',
            datePublished: '',
            isActive: false,
            isChecked: false,
            documents: [],
          },
          {
            id: 'status-step-3',
            status: 'Einde recht',
            description:
              '<p>\n            Uw recht op hulp bij het huishouden (geleverd) is beëindigd per \n          </p>',
            datePublished: null,
            isActive: false,
            isChecked: false,
            documents: [],
          },
        ],
        voorzieningsoortcode: 'WMH',
      },
      {
        id: '879359140',
        title: 'Hulp bij het huishouden (tijdelijk gestopt)',
        dateStart: '15 december 2021',
        dateEnd: '',
        supplier: 'Emile Thuiszorg',
        isActual: true,
        link: {
          title: 'Meer informatie',
          to: '/zorg-en-ondersteuning/voorzieningen/879359140',
        },
        steps: [
          {
            id: 'status-step-0',
            status: 'Besluit',
            description:
              '\n              <p>\n                U heeft recht op hulp bij het huishouden (tijdelijk gestopt) per 15 december 2021.\n              </p>\n              <p>\n                \n                    In de brief leest u ook hoe u bezwaar kunt maken, een klacht\n                    kan indienen of <u>hoe u van aanbieder kunt wisselen.</u>\n                  \n              </p>\n            ',
            datePublished: '2022-01-15',
            isActive: false,
            isChecked: true,
            documents: [],
            altDocumentContent:
              '<p>\n            <strong>\n              U krijgt dit besluit per post.\n            </strong>\n          </p>',
          },
          {
            id: 'status-step-1',
            status: 'Levering gestart',
            description:
              '<p>\n            Emile Thuiszorg is gestart met het leveren van hulp bij het huishouden (tijdelijk gestopt).\n          </p>',
            datePublished: '',
            isActive: false,
            isChecked: true,
            documents: [],
          },
          {
            id: 'status-step-2',
            status: 'Levering gestopt',
            description:
              '<p>\n            Niet van toepassing.\n          </p>',
            datePublished: '',
            isActive: true,
            isChecked: true,
            documents: [],
          },
          {
            id: 'status-step-3',
            status: 'Einde recht',
            description:
              '<p>\n            Uw recht op hulp bij het huishouden (tijdelijk gestopt) is beëindigd per \n          </p>',
            datePublished: null,
            isActive: false,
            isChecked: false,
            documents: [],
          },
        ],
        voorzieningsoortcode: 'WMH',
      },
      {
        id: '8927959',
        title: 'Hulp bij het huishouden (gestopt)',
        dateStart: '15 december 2021',
        dateEnd: '22 januari 2022',
        supplier: 'Emile Thuiszorg',
        isActual: false,
        link: {
          title: 'Meer informatie',
          to: '/zorg-en-ondersteuning/voorzieningen/8927959',
        },
        steps: [
          {
            id: 'status-step-0',
            status: 'Besluit',
            description:
              '\n              <p>\n                U heeft recht op hulp bij het huishouden (gestopt) per 15 december 2021.\n              </p>\n              <p>\n                In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan\n              indienen.\n              </p>\n            ',
            datePublished: '2022-01-15',
            isActive: false,
            isChecked: true,
            documents: [],
            altDocumentContent:
              '<p>\n            <strong>\n              U heeft dit besluit per post ontvangen.\n            </strong>\n          </p>',
          },
          {
            id: 'status-step-1',
            status: 'Levering gestart',
            description:
              '<p>\n            Emile Thuiszorg is gestart met het leveren van hulp bij het huishouden (gestopt).\n          </p>',
            datePublished: '',
            isActive: false,
            isChecked: true,
            documents: [],
          },
          {
            id: 'status-step-2',
            status: 'Levering gestopt',
            description:
              '<p>\n            Emile Thuiszorg heeft aan ons doorgegeven dat u geen hulp bij het huishouden (gestopt)\n            meer krijgt.\n          </p>',
            datePublished: '',
            isActive: false,
            isChecked: true,
            documents: [],
          },
          {
            id: 'status-step-3',
            status: 'Einde recht',
            description:
              '<p>\n            Uw recht op hulp bij het huishouden (gestopt) is beëindigd per 22 januari 2022\n          </p>',
            datePublished: '2022-01-22',
            isActive: true,
            isChecked: false,
            documents: [],
          },
        ],
        voorzieningsoortcode: 'WMH',
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

function testDetailPage(id: string, title: string) {
  const routeEntry = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
    id,
  });
  const routePath = AppRoutes['ZORG/VOORZIENINGEN'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ZorgDetail}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot for item ' + title, () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
}

describe('<Zorg />', () => {
  const item1 = testState.WMO.content[0];
  testDetailPage(item1.id, item1.title);

  const item2 = testState.WMO.content[1];
  testDetailPage(item2.id, item2.title);

  const item3 = testState.WMO.content[2];
  testDetailPage(item3.id, item3.title);

  const item4 = testState.WMO.content[3];
  testDetailPage(item4.id, item4.title);

  const item5 = testState.WMO.content[4];
  testDetailPage(item5.id, item5.title);
});
