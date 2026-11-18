import { expect, test } from '@playwright/test';

test('Arc restores tab, source, collection, sort, and page state from a deep link', async ({ page }) => {
  await page.goto('./arc/?tab=notes&source=button&source=tabs&q=clear&sort=desc&page=5#specimen-tabs');

  await expect(page.getByRole('tab', { name: 'Field Notes' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Field Notes' })).toContainText('Observations in Context');
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page.locator('#specimen-tabs details')).toHaveAttribute('open', '');
  await expect(page.getByRole('searchbox', { name: 'Filter resources' })).toHaveValue('clear');
  await expect(page.getByRole('button', { name: 'Title: Z–A' })).toBeVisible();
  await expect(page.locator('.arc-resource-row strong')).toHaveText(['Principles of Clear Revision']);
  await expect(page.getByRole('link', { name: 'Page 5', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/#specimen-tabs$/);
  await expect(page.locator('#specimen-tabs')).toBeInViewport({ ratio: 0.01 });

  await page.reload();
  await expect(page.getByRole('tab', { name: 'Field Notes' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page.locator('#specimen-tabs details')).toHaveAttribute('open', '');
  await expect(page.getByRole('link', { name: 'Page 5', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#specimen-tabs')).toBeInViewport({ ratio: 0.01 });
});

test('Arc restores deliberate tab, disclosure, and pagination changes through browser history', async ({ page }) => {
  await page.goto('./arc/?keep=yes#specimen-tabs');

  await page.getByRole('tab', { name: 'Field Notes' }).click();
  await expect(page).toHaveURL(/keep=yes&tab=notes#specimen-tabs$/);
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect(page.getByRole('tab', { name: 'Field Notes' })).toHaveAttribute('aria-selected', 'true');

  await page.locator('#specimen-button summary').click();
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page).toHaveURL(/source=button/);
  await page.locator('#specimen-tabs summary').click();
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page.locator('#specimen-tabs details')).toHaveAttribute('open', '');
  await expect(page).toHaveURL(/source=button&source=tabs/);
  await page.goBack();
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page.locator('#specimen-tabs details')).not.toHaveAttribute('open', '');
  await page.goForward();
  await expect(page.locator('#specimen-tabs details')).toHaveAttribute('open', '');

  await page.getByRole('link', { name: 'Page 4', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Page 4', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/page=4#specimen-tabs$/);
  await page.goBack();
  await expect(page.getByRole('link', { name: 'Page 3', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.goForward();
  await expect(page.getByRole('link', { name: 'Page 4', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/keep=yes/);
});

test('Arc replaces search history while typing and pushes sort and clear-filter decisions', async ({ page }) => {
  await page.goto('./arc/#composition');
  const initialHistoryLength = await page.evaluate(() => history.length);
  const search = page.getByRole('searchbox', { name: 'Filter resources' });

  await search.click();
  await search.pressSequentially('missing', { delay: 20 });
  await expect(search).toHaveValue('missing');
  await expect(page.getByRole('heading', { name: 'No Matching Resources' })).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength);
  await expect(page).toHaveURL(/q=missing#composition$/);

  await page.getByRole('button', { name: 'Title: A–Z' }).click();
  await expect(page).toHaveURL(/q=missing&sort=desc#composition$/);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Title: A–Z' })).toBeVisible();
  await expect(search).toHaveValue('missing');
  await page.goForward();
  await expect(page.getByRole('button', { name: 'Title: Z–A' })).toBeVisible();

  await page.getByRole('button', { name: 'Clear Filter' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.arc-resource-row')).toHaveCount(3);
  await expect(page).toHaveURL(/sort=desc#composition$/);
  await expect(page).not.toHaveURL(/q=/);
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 2);
  await page.goBack();
  await expect(search).toHaveValue('missing');
  await expect(page.getByRole('button', { name: 'Title: Z–A' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No Matching Resources' })).toBeVisible();
  await page.goForward();
  await expect(search).toHaveValue('');
  await expect(page.locator('.arc-resource-row')).toHaveCount(3);
});

test('Arc safely validates unknown, duplicate, disabled, and out-of-range URL values', async ({ page }) => {
  await page.goto('./arc/?tab=restricted&source=unknown&source=button&source=button&q=&sort=random&page=999');
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  await expect(page.locator('details[open]')).toHaveCount(1);
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page.getByRole('searchbox', { name: 'Filter resources' })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Title: A–Z' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Page 8', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('button', { name: 'Next Page' })).toBeDisabled();

  await page.goto('./arc/?page=0');
  await expect(page.getByRole('link', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('button', { name: 'Previous Page' })).toBeDisabled();

  await page.goto('./arc/?page=not-a-number');
  await expect(page.getByRole('link', { name: 'Page 3', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('Arc pagination preserves native modified and middle-click navigation', async ({ page, context }) => {
  await page.goto('./arc/?keep=yes&q=clear&sort=desc#specimen-pagination');
  const pageLink = page.getByRole('link', { name: 'Page 4', exact: true });
  await expect(pageLink).toHaveAttribute('href', '/arc-bard-design-systems/arc/?keep=yes&q=clear&sort=desc&page=4#specimen-pagination');

  const [modifiedPage] = await Promise.all([
    context.waitForEvent('page'),
    pageLink.click({ modifiers: ['Control'] }),
  ]);
  await modifiedPage.waitForLoadState();
  await expect(modifiedPage.getByRole('link', { name: 'Page 4', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(modifiedPage).toHaveURL(/page=4#specimen-pagination$/);
  await expect(page.getByRole('link', { name: 'Page 3', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page).not.toHaveURL(/page=4/);
  await modifiedPage.close();

  const [middlePage] = await Promise.all([
    context.waitForEvent('page'),
    pageLink.click({ button: 'middle' }),
  ]);
  await middlePage.waitForLoadState();
  await expect(middlePage.getByRole('link', { name: 'Page 4', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Page 3', exact: true })).toHaveAttribute('aria-current', 'page');
  await middlePage.close();
});

test('Arc preserves tab keyboard behavior, panel focus, and native disclosure keyboard controls', async ({ page }) => {
  await page.goto('./arc/#specimen-tabs');
  const overview = page.getByRole('tab', { name: 'Overview' });
  const notes = page.getByRole('tab', { name: 'Field Notes' });
  const history = page.getByRole('tab', { name: 'History' });
  const restricted = page.getByRole('tab', { name: 'Restricted' });

  await expect(restricted).toBeDisabled();
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(notes).toBeFocused();
  await expect(notes).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Field Notes' })).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('ArrowRight');
  await expect(history).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(overview).toBeFocused();
  await page.keyboard.press('End');
  await expect(history).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(history).toHaveAttribute('aria-selected', 'true');

  const summary = page.locator('#specimen-button summary');
  await summary.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#specimen-button details')).toHaveAttribute('open', '');
  await expect(page).toHaveURL(/source=button#specimen-tabs$/);
  await page.keyboard.press('Enter');
  await expect(page.locator('#specimen-button details')).not.toHaveAttribute('open', '');
  await expect(page).not.toHaveURL(/source=button/);
});

test('Arc exposes reviewed form metadata, persistent live regions, and matching React examples', async ({ page }) => {
  await page.goto('./arc/#specimen-text-input');
  const email = page.getByRole('textbox', { name: 'Email address' });
  const title = page.getByRole('textbox', { name: 'Resource title' });
  const search = page.getByRole('searchbox', { name: 'Filter resources' });

  await expect(email).toHaveAttribute('name', 'email');
  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveAttribute('autocomplete', 'off');
  await expect(email).toHaveAttribute('spellcheck', 'false');
  await expect(title).toHaveAttribute('name', 'resource-title');
  await expect(title).toHaveAttribute('autocomplete', 'off');
  await expect(page.getByRole('textbox', { name: 'Reference (disabled)' })).toHaveAttribute('name', 'resource-reference');
  await expect(page.getByRole('textbox', { name: 'Summary', exact: true })).toHaveAttribute('name', 'resource-summary');
  await expect(page.getByRole('textbox', { name: 'Summary', exact: true })).toHaveAttribute('autocomplete', 'off');
  await expect(page.getByRole('combobox', { name: 'Publication status' })).toHaveAttribute('name', 'publication-status');
  await expect(page.getByRole('combobox', { name: 'Publication status' })).toHaveAttribute('autocomplete', 'off');
  await expect(page.getByRole('combobox', { name: 'Unavailable selection' })).toHaveAttribute('name', 'unavailable-selection');
  await expect(search).toHaveAttribute('name', 'resource-filter');
  await expect(search).toHaveAttribute('autocomplete', 'off');
  await expect(search).toHaveAttribute('placeholder', 'Try “clear revision”…');

  const emailMessageId = await email.getAttribute('aria-describedby');
  const emailMessage = page.locator(`#${emailMessageId}`);
  await expect(emailMessage).toHaveAttribute('role', 'status');
  await expect(emailMessage).toHaveAttribute('aria-live', 'polite');
  await expect(emailMessage).toHaveAttribute('aria-atomic', 'true');
  await expect(emailMessage).toHaveCSS('display', 'flex');
  await email.fill('invalid');
  await expect(emailMessage).toContainText('Enter a complete email address.');
  await expect(email).toHaveAttribute('aria-describedby', emailMessageId!);

  const titleMessageId = await title.getAttribute('aria-describedby');
  const titleMessage = page.locator(`#${titleMessageId}`);
  await title.fill('abc');
  await expect(titleMessage).toContainText('Use at least 4 characters.');
  await expect(titleMessage).toHaveAttribute('role', 'status');
  await title.fill('Field Notes');
  await expect(titleMessage).toContainText('Title is available');
  await expect(title).toHaveAttribute('aria-describedby', titleMessageId!);

  await page.getByRole('button', { name: 'Create a Collection' }).click();
  await expect(page.getByRole('textbox', { name: 'Collection name' })).toHaveAttribute('name', 'collection-name');
  await expect(page.getByRole('textbox', { name: 'Collection name' })).toHaveAttribute('autocomplete', 'off');
  await page.keyboard.press('Escape');

  const inputExample = page.locator('#specimen-text-input code');
  await expect(inputExample).toContainText('name="email"');
  await expect(inputExample).toContainText('autoComplete="off"');
  await expect(inputExample).toContainText('spellCheck={false}');
  await expect(page.locator('#specimen-textarea code')).toContainText('name="resource-summary"');
  await expect(page.locator('#specimen-select code')).toContainText('name="publication-status"');
  await expect(page.locator('#specimen-tabs code')).toContainText('value={tab} onValueChange={setTab}');
  await expect(page.locator('#specimen-pagination code')).toContainText('getPageUrl={getPageUrl}');
});

test.describe('Arc locale-ready content', () => {
  test.use({ locale: 'de-DE', timezoneId: 'America/New_York' });

  test('formats slider output and limits without changing its numeric value', async ({ page }) => {
    await page.goto('./arc/#specimen-slider');

    const slider = page.getByRole('slider', { name: 'Preview density' });
    const specimen = page.locator('#specimen-slider');
    await expect(slider).toHaveValue('64');
    await expect(specimen.locator('.arc-slider').first().locator('output')).toHaveText('64\u00a0%');
    await expect(specimen.locator('.arc-slider').first().locator('.arc-slider__limits span')).toHaveText(['0\u00a0%', '100\u00a0%']);
    await expect(specimen.locator('.arc-demo-note')).toContainText('64\u00a0%');
  });

  test('formats dated table data and pagination from numeric values', async ({ page }) => {
    await page.goto('./arc/?page=8#specimen-table');

    const firstResource = page.getByRole('row').filter({ hasText: 'Botanical index' });
    await expect(firstResource.locator('time')).toHaveAttribute('datetime', '2026-11-12');
    await expect(firstResource.locator('time')).toHaveText('12.11.2026');
    await expect(firstResource.locator('.arc-numeric')).toHaveText('128');

    const pagination = page.locator('#specimen-pagination');
    await expect(pagination.getByRole('link', { name: 'Page 8', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(pagination.locator('.arc-demo-note')).toContainText('Page 8 of 8.');
    await expect(page.locator('.arc-section-nav__links a').first().locator('span')).toHaveText('01');
  });

  test('formats editorial counts, ledger numbers, and number-unit pairs', async ({ page }) => {
    await page.goto('./arc/');

    await expect(page.locator('#components .arc-section-heading__number')).toHaveText('06');
    await expect(page.locator('#components .arc-section-heading h2')).toHaveText('19 Instruments, One Register.');
    await expect(page.locator('.arc-component-index a').first().locator('span')).toHaveText('01');
    await expect(page.locator('.arc-swatch').first().locator('.arc-swatch__color span').first()).toHaveText('01');
    await expect(page.locator('.arc-space-scale h3 span')).toHaveText('4\u00a0px Base');
    await expect(page.locator('.arc-motion-specs article').first().locator('span')).toHaveText('120\u00a0ms');
    await expect(page.locator('.arc-resource-fragment .arc-fragment__count')).toHaveText('3 / 3');
    await expect(page.locator('.arc-resource-row').first()).toContainText('8\u00a0min read');
    await expect(page.locator('.arc-decision-list li').last()).toContainText('320\u00a0pixels');
  });
});

test('Arc falls back to the document language when browser languages are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', { configurable: true, get: () => [] });
    Object.defineProperty(navigator, 'language', { configurable: true, get: () => '' });
    const setDocumentLanguage = () => {
      if (!document.documentElement) return false;
      document.documentElement.lang = 'en-GB';
      return true;
    };
    if (setDocumentLanguage()) return;
    const observer = new MutationObserver(() => {
      if (setDocumentLanguage()) observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('./arc/#specimen-table');

  await expect(page.getByRole('row').filter({ hasText: 'Botanical index' }).locator('time')).toHaveText('12 Nov 2026');
});

test('Arc protects brands, font names, code, and identifiers without protecting surrounding prose', async ({ page }) => {
  await page.goto('./arc/');

  await expect(page.locator('.arc-hero h1')).toHaveAttribute('translate', 'no');
  await expect(page.locator('.arc-hero h1')).toHaveClass(/notranslate/);
  const fontName = page.locator('#typography .arc-section-heading__intro [data-protected-text]').first();
  await expect(fontName).toHaveText('Fraunces');
  await expect(fontName).toHaveAttribute('translate', 'no');
  await expect(page.locator('#typography .arc-section-heading__intro')).not.toHaveAttribute('translate', 'no');
  await expect(page.locator('#specimen-button pre code')).toHaveAttribute('translate', 'no');
  await expect(page.locator('#specimen-button pre code')).toHaveClass(/notranslate/);
  await expect(page.locator('#specimen-button .arc-specimen__description')).not.toHaveAttribute('translate', 'no');
  await expect(page.getByRole('textbox', { name: 'Reference (disabled)' })).toHaveAttribute('translate', 'no');

  await page.getByRole('button', { name: 'Create a Collection' }).click();
  const dialogIdentifier = page.getByRole('dialog').locator('[data-protected-text]').filter({ hasText: 'ARC-COLLECTION' });
  await expect(dialogIdentifier).toHaveAttribute('translate', 'no');
  await expect(dialogIdentifier.locator('..')).not.toHaveAttribute('translate', 'no');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Show Reference Toast' }).click();
  const toastIdentifier = page.getByRole('status').locator('[data-protected-text]').filter({ hasText: 'ARCHIVALREFERENCE' });
  await expect(toastIdentifier).toHaveAttribute('translate', 'no');
  await expect(toastIdentifier.locator('..')).not.toHaveAttribute('translate', 'no');
});

test('Arc uses specific title-case actions, loading ellipses, and matching source examples', async ({ page }) => {
  await page.goto('./arc/#specimen-button');

  const save = page.getByRole('button', { name: 'Save Changes', exact: true });
  await save.click();
  await expect(page.getByRole('button', { name: 'Saving Changes…', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview Specimen', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Specimen Details', exact: true })).toBeVisible();
  await expect(page.locator('#specimen-button code')).toContainText('Save Changes');
  await expect(page.locator('#specimen-button code')).toContainText('Preview Specimen');
  await expect(page.locator('#specimen-button code')).toContainText('Saving Changes…');
  await expect(page.locator('#specimen-slider code')).toContainText("formatUnit(density, '%')");
  await expect(page.locator('#specimen-table code')).toContainText('formatDate(row.revisedAt)');
  await expect(page.locator('#specimen-table code')).toContainText('formatNumber(row.entries)');

  const source = page.locator('#specimen-button summary');
  await expect(source).toContainText('React Example');
  await expect(source).toContainText('View Source');
  await source.click();
  expect(await source.locator('.arc-code__action').evaluate((element) => getComputedStyle(element, '::after').content)).toBe('"Hide Source"');
  await expect(page.locator('#specimen-dialog .arc-demo-note')).toContainText('Shift\u00a0+\u00a0Tab');
});

test('Arc announces clipboard success with a matching visible control state', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => undefined } });
  });
  await page.goto('./arc/#color');
  const swatch = page.locator('.arc-swatch').filter({ hasText: 'Page ground' });
  const button = swatch.getByRole('button', { name: 'Copy Paper token #F4EFE4' });
  const status = swatch.getByRole('status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toHaveText('');

  await button.click();
  await expect(status).toContainText('Copied #F4EFE4 to the clipboard.');
  await expect(button).toContainText('Copied');
});

test('Arc announces clipboard failure with manual recovery and no false copied state', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied'); } } });
  });
  await page.goto('./arc/#color');
  const swatch = page.locator('.arc-swatch').filter({ hasText: 'Page ground' });
  const button = swatch.getByRole('button', { name: 'Copy Paper token #F4EFE4' });
  const status = swatch.getByRole('status');

  await button.click();
  await expect(status).toContainText('Couldn’t copy #F4EFE4. Copy the value manually.');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(button).toContainText('#F4EFE4');
  await expect(button).not.toContainText('Copied');
});
