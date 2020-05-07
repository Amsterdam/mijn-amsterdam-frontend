import { transformWMOResponse, WMOSourceData } from './wmo';
import wmoData from '../mock-data/json/wmo.json';

const testData = wmoData as WMOSourceData;

it('Should format WMO data correctly', () => {
  expect(
    transformWMOResponse(testData, new Date(2019, 8, 20))
  ).toMatchSnapshot();
});
