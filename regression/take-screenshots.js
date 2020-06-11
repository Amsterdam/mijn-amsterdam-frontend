const { takeScreenshot } = require('./helpers/utils');
const puppeteer = require('puppeteer');

const pageConfig = {
  // Personalized pages
  BURGERZAKEN: {
    // hasCollapsiblePanels: true, // Only expanded initially at the moment
    pathname: '/burgerzaken',
  },
  BURGERZAKEN_DOCUMENT: {
    isDetailPage: true,
    pathname: '/burgerzaken/document/:id',
  },
  ZORG: {
    hasCollapsiblePanels: true,
    pathname: '/zorg-en-ondersteuning',
  },
  'ZORG/VOORZIENINGEN': {
    isDetailPage: true,
    pathname: '/zorg-en-ondersteuning/voorzieningen/:id',
  },
  INKOMEN: {
    hasCollapsiblePanels: true,
    pathname: '/inkomen-en-stadspas',
  },
  'INKOMEN/STADSPAS': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/stadspas/:id',
  },
  'INKOMEN/BIJSTANDSUITKERING': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/bijstandsuitkering/:id',
  },
  'INKOMEN/SPECIFICATIES': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/uitkeringsspecificaties/:type?',
  },
  'INKOMEN/TOZO': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/tozo/:id?',
  },
  BRP: {
    hasCollapsiblePanels: true,
    pathname: '/persoonlijke-gegevens',
  },
  AFVAL: {
    hasCollapsiblePanels: true,
    pathname: '/afval',
  },

  // Permanent non conditional pages
  BUURT: {
    isPermanentPage: true,
    pathname: '/buurt',
  },
  PROCLAIMER: {
    isPermanentPage: true,
    pathname: '/proclaimer',
  },
  TIPS: {
    isPermanentPage: true,
    pathname: '/overzicht-tips',
    waitForSelector: '[class*="MyTips_MyTips"] a[href*="overzicht-tips"]',
  },
  NOTIFICATIONS: {
    isPermanentPage: true,
    pathname: '/overzicht-updates',
  },
};

const BASE_URL = 'https://mijn.acc.amsterdam.nl';
// const BASE_URL = 'http://localhost:3000';
// const isHeadless = !BASE_URL.includes('localhost');
const isHeadless = false;

(async () => {
  const browser = await puppeteer.launch({
    headless: isHeadless,
  });
  let page = await browser.newPage();

  async function accLogin(user = '', pass = '') {
    await page.goto(BASE_URL + '/api/login');
    await page.waitForSelector('#authentication_type_account_basis');
    await page.click('#authentication_type_account_basis');
    await page.waitForSelector('#authentication_username');
    await page.waitForSelector('#authentication_password');
    await page.type('#authentication_username', user);
    await page.type('#authentication_password', pass);
    await page.click('#submit-button');
  }

  async function devLogin() {
    await page.goto(BASE_URL + '/logout');
    await page.goto(BASE_URL + '/test-api/login?target=digid');
  }

  async function expandCollapsiblePanels() {
    const elms = await page.$$(
      '[class*=SectionCollapsible_SectionCollapsible] [aria-expanded="false"]'
    );
    if (elms.length) {
      await Promise.all(elms.map(elm2 => elm2.click()));
    }
  }

  async function clickMainNavLink(path) {
    await page.hover('[data-submenu-id="MIJN_THEMAS"] > button');
    await page.waitFor(400);
    const link = await page.$('[href*="' + path + '"]');

    if (link) {
      await link.click();
      return true;
    } else {
      await page.click('[href="/"]');
      return false;
    }
  }

  await page.setViewport({
    width: 1440,
    height: 900,
  });

  async function visitPagesAndTakeScreenshots(appBase, user, pass) {
    if (!BASE_URL.includes('localhost')) {
      await accLogin(user, pass);
      await page.waitForNavigation({
        timeout: 30000,
        waitUntil: 'networkidle0',
      });
    } else {
      await devLogin();
    }

    console.log('\n\n Visiting pages for ' + user);
    await takeScreenshot(page, appBase + '/' + user + '-DASHBOARD');

    for (const [
      chapter,
      {
        pathname,
        isDetailPage,
        isPermanentPage,
        hasCollapsiblePanels,
        waitForSelector,
      },
    ] of Object.entries(pageConfig)) {
      const fileName = appBase + '/' + user + '-' + chapter.replace(/\//g, '_');
      const currentPathname = await page.evaluate(() => location.pathname);

      console.log('chapter:', chapter, 'current path:', currentPathname);

      if (isPermanentPage) {
        // Click the first link to this page
        if (currentPathname !== '/') {
          await page.click('[href="/"]');
        }
        if (waitForSelector) {
          await page.waitForSelector(waitForSelector);
          console.log('Waited for selector', waitForSelector);
        } else {
          const waitForSelector = 'a[href*="' + pathname + '"]';
          await page.waitForSelector(waitForSelector);
          console.log('Waited for selector', waitForSelector);
        }
        await page.click('a[href*="' + pathname + '"]');
        await takeScreenshot(page, fileName);
      } else if (isDetailPage) {
        const [detailPath] = pathname.split(':');
        const [, chapterPath] = detailPath.split('/');

        // First click the chapter
        const hasChapter = await clickMainNavLink('/' + chapterPath);

        if (!hasChapter) {
          continue;
        }

        if (hasCollapsiblePanels) {
          await expandCollapsiblePanels();
        }

        // Click the detail page link
        // Could fail if we show a link that has same url segment structure. E.g mijn.amsterdan.nl/burgerzaken/docment/x vs amsterdan.nl/burgerzaken/document/x
        let detailLinks = await page.$$('a[href*="' + detailPath + '"]');
        let len = detailLinks.length;

        for (let i = 0; i < len; i++) {
          const detailLink = detailLinks[i];

          if (detailLink) {
            await detailLink.click();
          }

          // Expand the statusline component should it be rendered collapsed
          const toggleMoreButton = await page.$('button[class*="_MoreStatus"]');

          if (toggleMoreButton) {
            await toggleMoreButton.click();
          }

          await takeScreenshot(page, fileName + '-' + i);
          await page.goBack();

          detailLinks = await page.$$('a[href*="' + detailPath + '"]');
        }

        await takeScreenshot(page, fileName);
      } else {
        const hasChapter = await clickMainNavLink(pathname);

        if (!hasChapter) {
          continue;
        }

        if (hasCollapsiblePanels) {
          await expandCollapsiblePanels();
        }

        await takeScreenshot(page, fileName);
      }
    }
  }

  const users = [];

  const appBase = 'bff-based';

  for (const [index, { user, pass }] of users.entries()) {
    if (index > 0) {
      await page.goto(BASE_URL + '/logout');
      await page.waitFor(1000);
    }
    await visitPagesAndTakeScreenshots(appBase, user, pass);
  }

  await browser.close();
})();
