import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const appUrl = './arc/flashcards/';

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    contentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

test('the Portal opens Arc Flashcards and exposes its study stage', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Open Arc Flashcards app prototype' }).click();
  await expect(page).toHaveURL(/\/arc\/flashcards\/$/);
  await expect(page.locator('.arc-flashcards')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Japanese essentials' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Preview of Japanese essentials, card 1' })).toContainText('水');
  await expect(page.getByRole('heading', { name: 'Recent sets' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All folders' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('the recent switcher changes the stage and keeps its preview aligned with practice options', async ({ page }) => {
  await page.goto(appUrl);
  const preview = page.getByRole('article', { name: 'Preview of Japanese essentials, card 1' });
  await expect(preview).toContainText('mizu');
  await expect(preview).not.toContainText('water');
  await page.locator('.fc-recent-switcher').getByRole('link', { name: /Human anatomy/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Human anatomy' })).toBeVisible();
  await expect(page).toHaveURL(/stage=human-anatomy/);
  await expect(page.getByRole('article', { name: 'Preview of Human anatomy, card 1' })).toContainText('The thigh bone');
  await expect(page.locator('.arc-theme-toggle span')).toBeVisible();
});

test('all six compact set choices fit in the desktop first viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chromium', 'Desktop first-viewport composition');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(appUrl);
  const choices = page.locator('.fc-recent-choice');
  await expect(choices).toHaveCount(6);
  const last = await choices.last().boundingBox();
  expect(last).not.toBeNull();
  expect((last?.y ?? 900) + (last?.height ?? 100)).toBeLessThanOrEqual(900);
});

test('a new set saves with its automatic name and persists after reload', async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole('button', { name: 'New set' }).click();
  await page.getByLabel('Card 1, Front').fill('Persimmon');
  await page.getByLabel('Card 1, Back').fill('A fruit');
  await page.getByRole('button', { name: 'Save set' }).first().click();

  await expect(page).toHaveURL(/set=set-/);
  await expect(page.getByRole('heading', { level: 1, name: 'Set 1' })).toBeVisible();
  await expect(page.getByText('Persimmon')).toBeVisible();
  await expect(page.getByText('A fruit')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('arc-flashcards-library-v1') ?? '{}'));
  expect(saved.sets.some((set: { name: string }) => set.name === 'Set 1')).toBe(true);

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Set 1' })).toBeVisible();
  await expect(page.getByText('Persimmon')).toBeVisible();
});

test('the editor preserves an invalid draft, fixes it, and adds a row from Tab', async ({ page }) => {
  await page.goto(`${appUrl}?edit=new`);
  await page.getByLabel('Card 1, Front').fill('Incomplete thought');
  await page.getByRole('button', { name: 'Save set' }).first().click();
  await expect(page.getByRole('alert').filter({ hasText: 'Your draft is still here.' })).toBeVisible();
  await expect(page.getByLabel('Card 1, Front')).toHaveValue('Incomplete thought');
  await expect(page.getByText('Card 1 has only 1 populated field.')).toBeVisible();

  await page.getByLabel('Card 1, Back').fill('Now complete');
  await page.getByLabel('Card 1, Back').press('Tab');
  await expect(page.getByLabel('Card 2, Front')).toBeFocused();
  await page.getByLabel('Card 2, Front').fill('Second front');
  await page.getByLabel('Card 2, Back').fill('Second back');
  await page.getByRole('button', { name: 'Save set' }).first().click();
  await expect(page.locator('.fc-card-list > ol > li')).toHaveCount(2);
});

test('early Don’t know reveals, survives reload, then continues to Known and resume', async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole('button', { name: /Practice this set/ }).click();
  await expect(page.getByRole('heading', { name: '12 cards match these sides' })).toBeVisible();
  await page.getByRole('button', { name: /Start practice/ }).click();
  const card = page.getByRole('article', { name: 'Practice card from Japanese essentials' });
  await expect(card).toContainText('水');
  await expect(card).not.toContainText('mizu');

  await page.keyboard.press('ArrowLeft');
  await expect(card).toContainText('mizu');
  await expect(page.getByText('Marked for the next batch. Read the answer, then choose Continue.')).toBeVisible();
  await page.reload();
  await expect(card).toContainText('mizu');
  await expect(page.getByText('Marked for the next batch. Read the answer, then choose Continue.')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(card).toContainText('木');
  await page.keyboard.press('ArrowRight');
  await expect(card).toContainText('駅');
  await page.getByRole('button', { name: 'Save & suspend' }).click();
  await expect(page.getByText('One paused session')).toBeVisible();
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('arc-flashcards-session-v1') ?? '{}'));
  expect(session.known).toBe(1);
  expect(session.repeated).toBe(1);
  expect(session.currentIndex).toBe(2);

  await page.getByRole('button', { name: /Resume practice/ }).click();
  await expect(page.getByRole('article', { name: 'Practice card from Japanese essentials' })).toContainText('駅');
});

test('the latest rating can be undone with U after a reload', async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole('button', { name: /Practice this set/ }).click();
  await page.getByRole('button', { name: /Start practice/ }).click();
  await page.getByRole('button', { name: /Known/ }).click();
  await expect(page.getByText('Card 2 of 10 in this batch')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /Undo last rating/ })).toBeVisible();

  await page.keyboard.press('u');
  const card = page.getByRole('article', { name: 'Practice card from Japanese essentials' });
  await expect(card).toContainText('水');
  await expect(page.getByText('Card 1 of 10 in this batch')).toBeVisible();
  await expect(page.getByText('0 of 12 cards known')).toBeVisible();
  await expect(page.getByRole('button', { name: /Undo last rating/ })).toHaveCount(0);
});

test('mobile study and folder controls stay separated and selected-folder Practice remains in view', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile control layout and sticky folder action');
  await page.goto(appUrl);
  const practiceSet = await page.getByRole('button', { name: /Practice this set/ }).boundingBox();
  const viewCards = await page.getByRole('link', { name: 'View all cards' }).boundingBox();
  expect(practiceSet).not.toBeNull();
  expect(viewCards).not.toBeNull();
  expect(viewCards?.y ?? 0).toBeGreaterThanOrEqual((practiceSet?.y ?? 0) + (practiceSet?.height ?? 0));

  const folderHeading = await page.getByRole('heading', { name: 'All folders' }).boundingBox();
  const inactiveAction = await page.getByRole('button', { name: 'Practice selected folders' }).boundingBox();
  expect(folderHeading).not.toBeNull();
  expect(inactiveAction).not.toBeNull();
  expect(inactiveAction?.y ?? 0).toBeGreaterThanOrEqual((folderHeading?.y ?? 0) + (folderHeading?.height ?? 0));

  await page.getByRole('checkbox', { name: 'Select Languages for practice' }).check();
  const action = page.getByRole('button', { name: 'Practice selected folders' });
  await expect(action).toBeEnabled();
  await expect(page.getByText('1 folder selected. Subfolders are included.')).toBeVisible();
  await expect(page.locator('.fc-folder-link').filter({ hasText: /^Languages/ })).toContainText('3 sets incl. subfolders');
  const bounds = await action.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(bounds?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual((viewport?.height ?? 0) + 1);
  await expectNoHorizontalOverflow(page);
});

test('recursive folder scope and related options expose the correct eligibility', async ({ page }) => {
  await page.goto(`${appUrl}?folder=languages`);
  await expect(page.getByRole('heading', { level: 1, name: 'Languages' })).toBeVisible();
  await expect(page.getByText('3 unique sets across this folder and all descendants.')).toBeVisible();
  await page.getByRole('button', { name: /Practice entire folder/ }).click();
  await expect(page).toHaveURL(/setup=1&folders=languages/);
  await expect(page.getByRole('heading', { name: '12 cards match these sides' })).toBeVisible();
  await expect(page.getByText('Only cards containing every chosen field are included. Other cards are skipped without being changed.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Start practice/ })).toBeEnabled();
});

test('deep links preserve unrelated query state and history', async ({ page, context }) => {
  await page.goto(`${appUrl}?keep=yes#flashcards-main`);
  const showAll = page.getByRole('link', { name: 'Show all 9 sets' });
  await expect(showAll).toHaveAttribute('href', '/arc-bard-design-systems/arc/flashcards/?keep=yes&all=1&stage=japanese-essentials#flashcards-main');
  await showAll.click();
  await expect(page.getByRole('heading', { name: 'Every set' })).toBeVisible();
  await expect(page).toHaveURL(/keep=yes&all=1&stage=japanese-essentials#flashcards-main$/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Recent sets' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Every set' })).toBeVisible();

  const current = page.getByRole('link', { name: 'Show six' });
  const [modifiedPage] = await Promise.all([
    context.waitForEvent('page'),
    current.click({ modifiers: ['Control'] }),
  ]);
  await modifiedPage.waitForLoadState();
  await expect(modifiedPage).toHaveURL(/keep=yes&stage=japanese-essentials#flashcards-main$/);
  await expect(modifiedPage.getByRole('heading', { name: 'Recent sets' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Every set' })).toBeVisible();
  await modifiedPage.close();
});

test('light and dark themes have no WCAG AA violations or horizontal overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(appUrl);
  const lightResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(lightResults.violations.map((violation) => violation.id)).toEqual([]);

  await page.getByRole('button', { name: 'Switch to Dark Mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const darkResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(darkResults.violations.map((violation) => violation.id)).toEqual([]);
  await expectNoHorizontalOverflow(page);
});

test('the editor grid contains its own overflow and remains accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${appUrl}?edit=new`);
  await page.getByRole('button', { name: 'Add field' }).click();
  await page.getByRole('button', { name: 'Add field' }).click();
  await expect(page.getByLabel('Flashcard union grid')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test('long multilingual content wraps without overlap and keeps its own text direction', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const library = {
    version: 1,
    folders: [{ id: 'languages', name: 'اللغات والدراسة', parentId: null }],
    sets: [{
      id: 'extreme-content',
      name: `بطاقات اللغة والثقافة ${'Wissenschaften '.repeat(12)}`,
      createdAt: '2026-11-19T12:00:00.000Z',
      updatedAt: '2026-11-19T12:00:00.000Z',
      folderIds: ['languages'],
      fields: [{ id: 'front', name: 'السؤال' }, { id: 'back', name: 'الإجابة' }],
      cards: [{
        id: 'card-1',
        values: {
          front: `مرحبا بالعالم 👋🏽 日本語 ${'UnbrokenContent'.repeat(24)}`,
          back: 'الإجابة الطويلة محفوظة كما كتبها المتعلم، مع العربية والعبرية: שלום עולם، والصينية: 学习卡片。',
        },
      }],
    }],
  };
  await page.addInitScript((saved) => window.localStorage.setItem('arc-flashcards-library-v1', JSON.stringify(saved)), library);
  await page.goto(appUrl);

  const preview = page.locator('.fc-paper-card');
  const front = preview.locator('.fc-paper-card__front p');
  await expect(front).toHaveAttribute('dir', 'auto');
  expect(await front.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');
  await expect(preview.locator('footer')).toContainText(library.sets[0].name);
  const content = await preview.locator('.fc-paper-card__content').boundingBox();
  const footer = await preview.locator('footer').boundingBox();
  expect(content).not.toBeNull();
  expect(footer).not.toBeNull();
  expect((content?.y ?? 0) + (content?.height ?? 0)).toBeLessThanOrEqual((footer?.y ?? 0) + 1);
  expect(await preview.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: /Practice this set/ }).click();
  await page.getByRole('button', { name: /Start practice/ }).click();
  await page.getByRole('button', { name: /Show answer/ }).click();
  await expect(page.locator('.fc-practice-card__back')).toContainText('שלום עולם');
  await expectNoHorizontalOverflow(page);
});

test('a 1,000-set library remains navigable without page overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Large-library stress coverage runs once');
  const library = {
    version: 1,
    folders: [],
    sets: Array.from({ length: 1000 }, (_, index) => ({
      id: `set-${index}`,
      name: `Set ${index + 1}`,
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
      folderIds: [],
      fields: [],
      cards: [],
    })),
  };
  await page.addInitScript((saved) => window.localStorage.setItem('arc-flashcards-library-v1', JSON.stringify(saved)), library);
  await page.goto(appUrl);
  await page.getByRole('link', { name: 'Show all 1,000 sets' }).click();
  await expect(page.locator('.fc-recent-list > li')).toHaveCount(1000);
  await expect(page.locator('.fc-recent-list > li').first()).toContainText('Set 1000');
  await expectNoHorizontalOverflow(page);
});

test('a quota failure explains the risk and offers an in-page retry', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Storage failure coverage runs once');
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key, value) {
      if (key === 'arc-flashcards-library-v1') throw new DOMException('Quota reached', 'QuotaExceededError');
      original.call(this, key, value);
    };
  });
  await page.goto(appUrl);
  const warning = page.getByRole('alert');
  await expect(warning).toContainText('Browser storage is unavailable or full.');
  await expect(warning).toContainText('lost if you close or reload');
  await expect(page.getByRole('button', { name: 'Try saving again' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
