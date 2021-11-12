import { transformWmoResponse, WmoApiData } from './wmo';
import wmoData from '../mock-data/json/wmo.json';

const testData = wmoData as WmoApiData;

it('Should format WMO data correctly', () => {
  expect(
    transformWmoResponse(testData.content || [], new Date(2019, 8, 20))
  ).toMatchSnapshot();
});
