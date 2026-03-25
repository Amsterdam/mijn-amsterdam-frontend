import { requestData } from '../helpers/source-api-request.ts';

async function testCache() {
  const r = (n: number) =>
    requestData({
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      method: 'GET',
      transformResponse: (data) => {
        console.log('Transforming response data', n);
        return data;
      },
    });
  const r1 = await r(1);
  console.log('Response 1:', r1);
  const r2 = await r(2);
  console.log('Response 2:', r2);
  process.exit(0);
}

testCache();
