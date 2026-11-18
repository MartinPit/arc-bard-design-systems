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
  await expect(page.getByRole('heading', { level: 1, name: 'Make Room for a Story.' })).toBeVisible();

  await page.getByRole('link', { name: 'Arc design system' }).click();
  await expect(page).toHaveURL(/\/arc\/$/);
  await expect(page.locator('[data-design-system="arc"]')).toBeVisible();
});

test('Reading Room restores section links and view state through direct URLs and browser history', async ({ page }) => {
  await page.goto(`${appUrl}?view=library&keep=yes#reading-room-main`);
  const library = page.getByRole('link', { name: 'Library', exact: true });
  const notes = page.getByRole('link', { name: /^Notes/ });

  await expect(page.getByRole('heading', { level: 1, name: 'The Library.' })).toBeVisible();
  await expect(library).toHaveAttribute('aria-current', 'page');
  await expect(library).toHaveAttribute('href', '/arc-bard-design-systems/arc/reading-room/?view=library&keep=yes#reading-room-main');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'The Library.' })).toBeVisible();

  await notes.click();
  await expect(page.getByRole('heading', { level: 1, name: 'From the Margins.' })).toBeVisible();
  await expect(notes).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/view=notes&keep=yes#reading-room-main$/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'The Library.' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'From the Margins.' })).toBeVisible();

  await page.goto(`${appUrl}?view=unknown`);
  await expect(page.getByRole('heading', { level: 1, name: 'Make Room for a Story.' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'No Books in This Corner' })).toBeVisible();
  await expect(page).toHaveURL(/q=Mina\+Sol&status=unread&keep=yes#reading-room-main$/);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1);
  await page.goBack();
  await expect(filter).toHaveValue('reading');
  await expect(page.getByText('1 volume found')).toBeVisible();
  await page.goForward();
  await expect(filter).toHaveValue('unread');
  await expect(page.getByRole('heading', { name: 'No Books in This Corner' })).toBeVisible();

  await page.getByRole('button', { name: 'Clear Search and Filters' }).click();
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
  await reader.getByRole('button', { name: 'Close Dialog' }).click();
  await expect(reader).toHaveCount(0);
  await expect(page).not.toHaveURL(/book=/);
  await page.goBack();
  await expect(reader).toBeVisible();
  await page.goForward();
  await expect(reader).toHaveCount(0);

  await page.goto(`${appUrl}?view=library&book=unknown`);
  await expect(page.getByRole('heading', { level: 1, name: 'The Library.' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('6 volumes found')).toBeVisible();

  await page.goto(appUrl);
  await page.getByRole('button', { name: 'Continue Reading The Cartographer of Quiet', exact: true }).click();
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
  await expect(modifiedPage.getByRole('heading', { level: 1, name: 'From the Margins.' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'The Library.' })).toBeVisible();
  await modifiedPage.close();

  const [middlePage] = await Promise.all([
    context.waitForEvent('page'),
    notes.click({ button: 'middle' }),
  ]);
  await middlePage.waitForLoadState();
  await expect(middlePage.getByRole('heading', { level: 1, name: 'From the Margins.' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'The Library.' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Add a Note' }).click();
  const dialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
  const book = dialog.getByRole('combobox', { name: 'Book' });
  const note = dialog.getByRole('textbox', { name: 'Your note' });
  await expect(book).toHaveAttribute('name', 'note-book');
  await expect(book).toHaveAttribute('autocomplete', 'off');
  await expect(note).toHaveAttribute('name', 'note');
  await expect(note).toHaveAttribute('autocomplete', 'off');
  await expect(note).toHaveAttribute('placeholder', 'A line about light gathering the room…');

  await note.fill('   \n  ');
  await dialog.getByRole('button', { name: 'Save Note' }).click();
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
  await page.getByRole('button', { name: 'Add a Note' }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  let warningCount = 0;
  page.on('dialog', async (dialog) => {
    if (dialog.type() !== 'beforeunload') throw new Error(`Unexpected ${dialog.type()} dialog`);
    warningCount += 1;
    await dialog.dismiss();
  });

  await page.getByRole('button', { name: 'Add a Note' }).click();
  let noteDialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
  await noteDialog.getByRole('textbox', { name: 'Your note' }).fill('   ');
  await noteDialog.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('link', { name: 'Arc design system' }).click();
  await expect.poll(() => warningCount).toBe(1);
  await expect(page).toHaveURL(/\/arc\/reading-room\/\?view=notes$/);

  await page.getByRole('link', { name: 'Today', exact: true }).click();
  expect(warningCount).toBe(1);
  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'Add a Note' }).click();
  noteDialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
  await expect(noteDialog.getByRole('textbox', { name: 'Your note' })).toHaveValue('   ');
  await noteDialog.getByRole('textbox', { name: 'Your note' }).fill('Keep this draft through navigation.');
  await noteDialog.getByRole('button', { name: 'Cancel' }).click();
  await page.evaluate(() => window.location.reload());
  await expect.poll(() => warningCount).toBe(2);
  await expect(page).toHaveURL(/\/arc\/reading-room\/\?view=notes$/);

  await page.getByRole('button', { name: 'Add a Note' }).click();
  noteDialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
  await expect(noteDialog.getByRole('textbox', { name: 'Your note' })).toHaveValue('Keep this draft through navigation.');
  await noteDialog.getByRole('button', { name: 'Save Note' }).click();
  await expect(noteDialog).toHaveCount(0);
  await expect(page.locator('.arc-reading-room-note').first()).toContainText('Keep this draft through navigation.');
  await page.reload();
  expect(warningCount).toBe(2);
  await expect(page.getByRole('heading', { level: 1, name: 'From the Margins.' })).toBeVisible();
});

test('the featured reading button preserves hover and pressed feedback', async ({ page }) => {
  await page.goto(appUrl);
  const button = page.getByRole('button', { name: 'Continue Reading The Cartographer of Quiet', exact: true });
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
  if (!bounds) throw new Error('Continue Reading The Cartographer of Quiet button has no layout bounds');
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
  await expect(page.getByRole('heading', { name: 'No Books in This Corner' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear Search and Filters' }).click();
  await expect(page.getByText('6 volumes found')).toBeVisible();
  await page.getByRole('button', { name: 'Save The Orchard at Night' }).click();
  await expect(page.getByRole('button', { name: 'Remove The Orchard at Night from saved books' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('You Saved a Book for Later', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove The Orchard at Night from saved books' }).click();
  await expect(page.getByRole('button', { name: 'Save The Orchard at Night' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Dismiss You Removed a Saved Book' }).click();

  await page.getByRole('link', { name: 'Today', exact: true }).click();
  await page.getByRole('button', { name: 'Continue Reading The Cartographer of Quiet', exact: true }).click();
  const reader = page.getByRole('dialog', { name: 'The Cartographer of Quiet' });
  await expect(reader).toBeVisible();
  await reader.getByRole('button', { name: 'Mark Chapter Read' }).click();
  await expect(reader).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Continue Reading The Cartographer of Quiet', exact: true })).toBeFocused();
  await expect(page.getByRole('status')).toContainText('You read 59% of The Cartographer of Quiet');
  await page.getByRole('button', { name: 'Dismiss You Marked a Chapter Read' }).click();

  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await page.getByRole('button', { name: 'Add a Note' }).click();
  const noteDialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
  await noteDialog.getByLabel('Your note').fill('A new thought to keep nearby.');
  await noteDialog.getByRole('button', { name: 'Save Note' }).click();
  await expect(page.locator('.arc-reading-room-note').first()).toContainText('A new thought to keep nearby.');
  await expect(page.getByRole('button', { name: 'Add a Note' })).toBeFocused();
  await expect(page.getByRole('status')).toContainText('You Pressed a Note into the Margin');
});

test.describe('Reading Room locale-ready content', () => {
  test.use({ locale: 'de-DE' });

  test('formats note and event dates, counts, units, and ledger numbers', async ({ page }) => {
    await page.goto(appUrl);

    await expect(page.locator('.arc-reading-room__page-header .arc-reading-room__eyebrow')).toContainText('Montag');
    await expect(page.locator('.arc-reading-room__page-header .arc-reading-room__eyebrow')).toContainText('16. November');
    await expect(page.locator('.arc-reading-room-feature__reading-meta')).toContainText('42\u00a0%');
    await expect(page.locator('.arc-reading-room-feature__reading-meta')).toContainText('12\u00a0min');
    await expect(page.locator('.arc-reading-room-club__date span')).toHaveText(['Nov', 'Do · 19:30']);
    await expect(page.locator('.arc-reading-room-club__date strong')).toHaveText('19');
    await expect(page.locator('.arc-reading-room-recent-note time')).toHaveAttribute('datetime', '2026-11-14T12:00:00');
    await expect(page.locator('.arc-reading-room-recent-note time')).toHaveText('14. Nov.');

    await page.getByRole('link', { name: 'Notes', exact: true }).click();
    await expect(page.locator('.arc-reading-room-note').first().locator('.arc-reading-room-note__number')).toHaveText('01');
    await expect(page.locator('.arc-reading-room-note').first().locator('time')).toHaveAttribute('datetime', '2026-11-14T12:00:00');
    await expect(page.locator('.arc-reading-room-note').first()).toContainText('14. Nov. · p. 86');
  });

  test('gives a saved personal note an ISO timestamp and localized relative-time label', async ({ page }) => {
    await page.goto(`${appUrl}?view=notes`);
    await page.getByRole('button', { name: 'Add a Note' }).click();
    const dialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
    await dialog.getByLabel('Your note').fill('A locale-ready observation.');
    await dialog.getByRole('button', { name: 'Save Note' }).click();

    const firstNote = page.locator('.arc-reading-room-note').first();
    await expect(firstNote.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    await expect(firstNote.locator('time')).toHaveText('jetzt');
    await expect(firstNote.locator('.arc-reading-room-note__date')).toContainText('· personal note');
  });

  test('formats catalogue counts, status output, and reader progress', async ({ page }) => {
    await page.goto(`${appUrl}?view=library&book=cartographer`);

    await expect(page.locator('.arc-reading-room__nav-index')).toHaveText(['01', '02', '03']);
    await expect(page.locator('.arc-reading-room__quiet-stats dd')).toHaveText(['03', '03']);
    await expect(page.getByText('6 volumes found')).toBeVisible();
    await expect(page.locator('.arc-reading-room__footer')).toContainText('FOLIO 02');

    const reader = page.getByRole('dialog', { name: 'The Cartographer of Quiet' });
    await expect(reader.locator('.arc-dialog__description')).toContainText('04 —');
    await expect(reader.locator('.arc-reading-room-reader__opening')).toContainText('42\u00a0%');
    await expect(page.getByLabel('Reading progress for The Cartographer of Quiet')).toHaveAttribute('value', '42');
  });
});

test('Reading Room protects Arc branding but leaves excerpts and notes translatable', async ({ page }) => {
  await page.goto(appUrl);

  await expect(page.locator('.arc-reading-room__wordmark')).toHaveAttribute('translate', 'no');
  await expect(page.locator('.arc-reading-room__wordmark')).toHaveClass(/notranslate/);
  await expect(page.locator('.arc-reading-room__tagline')).not.toHaveAttribute('translate', 'no');
  await expect(page.locator('.arc-reading-room-feature blockquote')).not.toHaveAttribute('translate', 'no');

  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  const prose = page.locator('.arc-reading-room-note blockquote').first();
  await expect(prose).not.toHaveAttribute('translate', 'no');
  expect(await prose.evaluate((element) => element.closest('[translate="no"]'))).toBeNull();
});

test('Reading Room names destinations with title-case, active actions', async ({ page }) => {
  await page.goto(appUrl);

  await expect(page.getByRole('heading', { level: 1, name: 'Make Room for a Story.' })).toBeVisible();
  const continueReading = page.getByRole('button', { name: 'Continue Reading The Cartographer of Quiet', exact: true });
  await expect(continueReading).toBeVisible();
  await continueReading.click();
  const reader = page.getByRole('dialog', { name: 'The Cartographer of Quiet' });
  await expect(reader.getByRole('button', { name: 'Mark Chapter Read' })).toBeVisible();
  await expect(reader.getByRole('button', { name: 'Close Dialog' })).toBeVisible();
  await expect(reader).toContainText('You keep your progress on this device for this visit.');
  await reader.getByRole('button', { name: 'Close Dialog' }).click();

  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add a Note' })).toBeVisible();
  await page.getByRole('button', { name: 'Add a Note' }).click();
  await expect(page.getByRole('button', { name: 'Save Note' })).toBeVisible();
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

  await page.getByRole('button', { name: 'Switch to Light Mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('arc-theme'))).toBe('light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Switch to Dark Mode' }).click();
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
