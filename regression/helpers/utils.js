const path = require('path');

const BASE_URL = 'http://localhost:3000';

function takeScreenshot(page, name) {
  const fileName = path.join(
    'integration',
    'screenshots',
    name || 'screenshot'
  );
  const filePath = fileName + '.png';
  console.log('p::', filePath);
  return page.screenshot({
    path: filePath,
    fullPage: true,
  });
}

async function findUrls() {
  const links = await page.$$('a');
  const properties = await Promise.all(
    links.map(link => link.getProperty('href'))
  );
  return Promise.all(properties.map(prop => prop.jsonValue()));
}

async function findAppUrls(params) {
  const urls = await findUrls();
  return urls.filter(url => url.startsWith(BASE_URL));
}

async function findUniqueAppUrls() {
  return Array.from(new Set(await findAppUrls()));
}

module.exports = {
  BASE_URL,
  takeScreenshot,
  findAppUrls,
  findUrls,
  findUniqueAppUrls,
};
