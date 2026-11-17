import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const appUrl = './arc/reading-room/';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    contentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

test('the Portal opens the Arc Reading Room and the app links back to Arc', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Open Arc Reading Room app prototype' }).click();
  await expect(page).toHaveURL(/\/arc\/reading-room\/$/);
  await expect(page.locator('[data-reading-room="arc"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Make room for a story.' })).toBeVisible();

  await page.getByRole('link', { name: 'Arc design system' }).click();
  await expect(page).toHaveURL(/\/arc\/$/);
  await expect(page.locator('[data-design-system="arc"]')).toBeVisible();
});

test('Reading Room restores section links and view state through direct URLs and browser history', async ({ page }) => {
  await page.goto(`${appUrl}?view=library&keep=yes#reading-room-main`);
  const library = page.getByRole('link', { name: 'Library', exact: true });
  const notes = page.getByRole('link', { name: /^Notes/ });

  await expect(page.getByRole('heading', { level: 1, name: 'The library.' })).toBeVisible();
  await expect(library).toHaveAttribute('aria-current', 'page');
  await expect(library).toHaveAttribute('href', '/arc-bard-design-systems/arc/reading-room/?view=library&keep=yes#reading-room-main');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'The library.' })).toBeVisible();

  await notes.click();
  await expect(page.getByRole('heading', { level: 1, name: 'From the margins.' })).toBeVisible();
  await expect(notes).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/view=notes&keep=yes#reading-room-main$/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'The library.' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'From the margins.' })).toBeVisible();

  await page.goto(`${appUrl}?view=unknown`);
  await expect(page.getByRole('heading', { level: 1, name: 'Make room for a story.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Today', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('Reading Room restores catalogue state and separates search typing from deliberate history changes', async ({ page }) => {
  await page.goto(`${appUrl}?view=library&q=Mina%20Sol&status=reading&keep=yes#reading-room-main`);
  const search = page.getByRole('searchbox', { name: 'Search your library' });
  const filter = page.getByRole('combobox', { name: 'Filter by reading status' });
  const initialHistoryLength = await page.evaluate(() => history.length);

  await expect(search).toHaveValue('Mina Sol');
  await expect(filter).toHaveValue('reading');
  await expect(page.getByText('1 volume found')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A Field Guide to Yellow Light' })).toBeVisible();
  await page.reload();
  await expect(search).toHaveValue('Mina Sol');
  await expect(filter).toHaveValue('reading');

  await filter.selectOption('unread');
  await expect(page.getByRole('heading', { name: 'No books in this corner' })).toBeVisible();
  await expect(page).toHaveURL(/q=Mina\+Sol&status=unread&keep=yes#reading-room-main$/);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1);
  await page.goBack();
  await expect(filter).toHaveValue('reading');
  await expect(page.getByText('1 volume found')).toBeVisible();
  await page.goForward();
  await expect(filter).toHaveValue('unread');
  await expect(page.getByRole('heading', { name: 'No books in this corner' })).toBeVisible();

  await page.getByRole('button', { name: 'Clear search and filters' }).click();
  await expect(search).toHaveValue('');
  await expect(filter).toHaveValue('all');
  await expect(page.getByText('6 volumes found')).toBeVisible();
  await expect(page).not.toHaveURL(/q=|status=/);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 2);
  await page.goBack();
  await expect(search).toHaveValue('Mina Sol');
  await expect(filter).toHaveValue('unread');
  await page.goForward();
  await expect(search).toHaveValue('');
  await expect(filter).toHaveValue('all');

  await search.click();
  await search.pressSequentially('Mina', { delay: 20 });
  await expect(search).toHaveValue('Mina');
  await expect(page.getByText('1 volume found')).toBeVisible();
  await expect(page).toHaveURL(/q=Mina/);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 2);

  await page.goto(`${appUrl}?view=library&status=unknown&q=`);
  await expect(search).toHaveValue('');
  await expect(filter).toHaveValue('all');
  await expect(page.getByText('6 volumes found')).toBeVisible();
});

test('Reading Room deep-links a validated reader volume and restores it through history', async ({ page }) => {
  await page.goto(`${appUrl}?view=library&book=yellow-light`);
  const reader = page.getByRole('dialog', { name: 'A Field Guide to Yellow Light' });

  await expect(reader).toBeVisible();
  await page.reload();
  await expect(reader).toBeVisible();
  await reader.getByRole('button', { name: 'Close dialog' }).click();
  await expect(reader).toHaveCount(0);
  await expect(page).not.toHaveURL(/book=/);
  await page.goBack();
  await expect(reader).toBeVisible();
  await page.goForward();
  await expect(reader).toHaveCount(0);

  await page.goto(`${appUrl}?view=library&book=unknown`);
  await expect(page.getByRole('heading', { level: 1, name: 'The library.' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('6 volumes found')).toBeVisible();

  await page.goto(appUrl);
  await page.getByRole('button', { name: 'Continue reading', exact: true }).click();
  const currentReader = page.getByRole('dialog', { name: 'The Cartographer of Quiet' });
  await expect(currentReader).toBeVisible();
  await expect(page).toHaveURL(/book=cartographer/);
  await page.goBack();
  await expect(currentReader).toHaveCount(0);
  await page.goForward();
  await expect(currentReader).toBeVisible();
});

test('Reading Room section links preserve native modified and middle-click navigation', async ({ page, context }) => {
  await page.goto(`${appUrl}?view=library&keep=yes#reading-room-main`);
  const notes = page.getByRole('link', { name: 'Notes', exact: true });
  await expect(notes).toHaveAttribute('href', '/arc-bard-design-systems/arc/reading-room/?view=notes&keep=yes#reading-room-main');

  const [modifiedPage] = await Promise.all([
    context.waitForEvent('page'),
    notes.click({ modifiers: ['Control'] }),
  ]);
  await modifiedPage.waitForLoadState();
  await expect(modifiedPage.getByRole('heading', { level: 1, name: 'From the margins.' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'The library.' })).toBeVisible();
  await modifiedPage.close();

  const [middlePage] = await Promise.all([
    context.waitForEvent('page'),
    notes.click({ button: 'middle' }),
  ]);
  await middlePage.waitForLoadState();
  await expect(middlePage.getByRole('heading', { level: 1, name: 'From the margins.' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'The library.' })).toBeVisible();
  await middlePage.close();
});

test('Reading Room section links keep visible hover and keyboard focus feedback', async ({ page }) => {
  await page.goto(appUrl);
  const library = page.getByRole('link', { name: 'Library', exact: true });
  const restingColor = await library.evaluate((element) => getComputedStyle(element).color);
  await library.hover();
  await expect.poll(async () => library.evaluate((element) => getComputedStyle(element).color)).not.toBe(restingColor);

  await library.focus();
  await expect(library).toBeFocused();
  const focusStyle = await library.evaluate((element) => ({
    style: getComputedStyle(element).outlineStyle,
    width: getComputedStyle(element).outlineWidth,
  }));
  expect(focusStyle.style).not.toBe('none');
  expect(focusStyle.width).not.toBe('0px');
});

test('Reading Room exposes form metadata and recovers a whitespace-only note without losing the draft', async ({ page }) => {
  await page.goto(`${appUrl}?view=library`);
  await expect(page.getByRole('searchbox', { name: 'Search your library' })).toHaveAttribute('name', 'library-search');
  await expect(page.getByRole('searchbox', { name: 'Search your library' })).toHaveAttribute('autocomplete', 'off');
  await expect(page.getByRole('combobox', { name: 'Filter by reading status' })).toHaveAttribute('name', 'reading-status');
  await expect(page.getByRole('combobox', { name: 'Filter by reading status' })).toHaveAttribute('autocomplete', 'off');

  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'Add a note' }).click();
  const dialog = page.getByRole('dialog', { name: 'Press a thought into the margin' });
  const book = dialog.getByRole('combobox', { name: 'Book' });
  const note = dialog.getByRole('textbox', { name: 'Your note' });
  await expect(book).toHaveAttribute('name', 'note-book');
  await expect(book).toHaveAttribute('autocomplete', 'off');
  await expect(note).toHaveAttribute('name', 'note');
  await expect(note).toHaveAttribute('autocomplete', 'off');
  await expect(note).toHaveAttribute('placeholder', 'A line about light gathering the room…');

  await note.fill('   \n  ');
  await dialog.getByRole('button', { name: 'Save note' }).click();
  await expect(note).toBeFocused();
  await expect(note).toHaveValue('   \n  ');
  await expect(note).toHaveAttribute('aria-invalid', 'true');
  const messageId = await note.getAttribute('aria-describedby');
  const message = dialog.locator(`#${messageId}`);
  await expect(message).toHaveAttribute('role', 'status');
  await expect(message).toHaveAttribute('aria-live', 'polite');
  await expect(message).toContainText('Enter a note before saving.');

  await note.fill('A thought worth keeping.');
  await expect(note).not.toHaveAttribute('aria-invalid', 'true');
  await expect(message).not.toContainText('Enter a note before saving.');
});

test('Reading Room warns before discarding nonempty drafts but allows blank and saved drafts', async ({ page }) => {
  await page.goto(`${appUrl}?view=notes`);
  await page.getByRole('button', { name: 'Add a note' }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  let warningCount = 0;
  page.on('dialog', async (dialog) => {
    if (dialog.type() !== 'beforeunload') throw new Error(`Unexpected ${dialog.type()} dialog`);
    warningCount += 1;
    await dialog.dismiss();
  });

  await page.getByRole('button', { name: 'Add a note' }).click();
  let noteDialog = page.getByRole('dialog', { name: 'Press a thought into the margin' });
  await noteDialog.getByRole('textbox', { name: 'Your note' }).fill('   ');
  await noteDialog.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('link', { name: 'Arc design system' }).click();
  await expect.poll(() => warningCount).toBe(1);
  await expect(page).toHaveURL(/\/arc\/reading-room\/\?view=notes$/);

  await page.getByRole('link', { name: 'Today', exact: true }).click();
  expect(warningCount).toBe(1);
  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'Add a note' }).click();
  noteDialog = page.getByRole('dialog', { name: 'Press a thought into the margin' });
  await expect(noteDialog.getByRole('textbox', { name: 'Your note' })).toHaveValue('   ');
  await noteDialog.getByRole('textbox', { name: 'Your note' }).fill('Keep this draft through navigation.');
  await noteDialog.getByRole('button', { name: 'Cancel' }).click();
  await page.evaluate(() => window.location.reload());
  await expect.poll(() => warningCount).toBe(2);
  await expect(page).toHaveURL(/\/arc\/reading-room\/\?view=notes$/);

  await page.getByRole('button', { name: 'Add a note' }).click();
  noteDialog = page.getByRole('dialog', { name: 'Press a thought into the margin' });
  await expect(noteDialog.getByRole('textbox', { name: 'Your note' })).toHaveValue('Keep this draft through navigation.');
  await noteDialog.getByRole('button', { name: 'Save note' }).click();
  await expect(noteDialog).toHaveCount(0);
  await expect(page.locator('.arc-reading-room-note').first()).toContainText('Keep this draft through navigation.');
  await page.reload();
  expect(warningCount).toBe(2);
  await expect(page.getByRole('heading', { level: 1, name: 'From the margins.' })).toBeVisible();
});

test('the featured reading button preserves hover and pressed feedback', async ({ page }) => {
  await page.goto(appUrl);
  const button = page.getByRole('button', { name: 'Continue reading', exact: true });
  const readStyle = () => button.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, shadow: style.boxShadow, transform: style.transform };
  });

  const resting = await readStyle();
  await button.hover();
  await expect.poll(async () => (await readStyle()).background).not.toBe(resting.background);
  await expect.poll(async () => (await readStyle()).shadow).not.toBe(resting.shadow);
  expect((await readStyle()).transform).not.toBe('none');

  const bounds = await button.boundingBox();
  if (!bounds) throw new Error('Continue reading button has no layout bounds');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await expect.poll(async () => (await readStyle()).shadow).toBe('none');
  expect((await readStyle()).transform).not.toBe('none');
  await page.mouse.up();
});

test('library search, reader progress, saved books, and notes work', async ({ page }) => {
  await page.goto(appUrl);
  await page.getByRole('link', { name: 'Library', exact: true }).click();

  const search = page.getByRole('searchbox', { name: 'Search your library' });
  await search.fill('Mina Sol');
  await expect(page.getByText('1 volume found')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A Field Guide to Yellow Light' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Orchard at Night' })).toHaveCount(0);
  await search.fill('No such volume');
  await expect(page.getByRole('heading', { name: 'No books in this corner' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search and filters' }).click();
  await expect(page.getByText('6 volumes found')).toBeVisible();
  await page.getByRole('button', { name: 'Save The Orchard at Night' }).click();
  await expect(page.getByRole('button', { name: 'Remove The Orchard at Night from saved books' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Saved for later', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove The Orchard at Night from saved books' }).click();
  await expect(page.getByRole('button', { name: 'Save The Orchard at Night' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Dismiss Removed from saved' }).click();

  await page.getByRole('link', { name: 'Today', exact: true }).click();
  await page.getByRole('button', { name: 'Continue reading', exact: true }).click();
  const reader = page.getByRole('dialog', { name: 'The Cartographer of Quiet' });
  await expect(reader).toBeVisible();
  await reader.getByRole('button', { name: 'Mark chapter read' }).click();
  await expect(reader).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Continue reading', exact: true })).toBeFocused();
  await expect(page.getByRole('status')).toContainText('now 59% read');
  await page.getByRole('button', { name: 'Dismiss Chapter marked read' }).click();

  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'Add a note' }).click();
  const noteDialog = page.getByRole('dialog', { name: 'Press a thought into the margin' });
  await noteDialog.getByLabel('Your note').fill('A new thought to keep nearby.');
  await noteDialog.getByRole('button', { name: 'Save note' }).click();
  await expect(page.locator('.arc-reading-room-note').first()).toContainText('A new thought to keep nearby.');
  await expect(page.getByRole('button', { name: 'Add a note' })).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Note pressed into the margin');
});

test('the app fits the viewport, supports keyboard focus, and meets WCAG AA', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(appUrl);

  await expectNoHorizontalOverflow(page);
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toBeVisible();

  for (const section of ['Library', 'Notes'] as const) {
    await page.getByRole('link', { name: section, exact: true }).click();
    await expectNoHorizontalOverflow(page);
  }

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((violation) => ({
    id: violation.id,
    nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
  }))).toEqual([]);
});

test('dark mode persists and remains accessible', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(appUrl);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('arc-theme'))).toBe('light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expectNoHorizontalOverflow(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((violation) => ({
    id: violation.id,
    nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
  }))).toEqual([]);
});
