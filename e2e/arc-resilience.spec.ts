import { expect, test, type Locator, type Page } from '@playwright/test';

async function placeAndOpenPopover(page: Page, vertical: 'top' | 'bottom' | 'center', horizontal: 'left' | 'right' | 'center') {
  const trigger = page.locator('#specimen-popover').getByRole('button', { name: 'Display Options' });
  await trigger.evaluate((button, placement) => {
    button.style.position = 'fixed';
    button.style.margin = '0';
    button.style.zIndex = '100';
    button.style.top = placement.vertical === 'top' ? '0px' : placement.vertical === 'center' ? '45%' : 'auto';
    button.style.bottom = placement.vertical === 'bottom' ? '0px' : 'auto';
    button.style.left = placement.horizontal === 'left' ? '0px' : placement.horizontal === 'center' ? 'calc(50% - 70px)' : 'auto';
    button.style.right = placement.horizontal === 'right' ? '0px' : 'auto';
    button.click();
  }, { vertical, horizontal });
  const panel = page.getByRole('dialog', { name: 'Display Options', exact: true });
  await expect(panel).toBeVisible();
  await expect(panel).toBeFocused();
  return { trigger, panel };
}

async function expectWithinViewport(page: Page, selector: string) {
  const bounds = await page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, viewportWidth: document.documentElement.clientWidth, viewportHeight: window.innerHeight };
  });
  expect(bounds.top).toBeGreaterThanOrEqual(-1);
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight + 1);
}

async function expectNoHorizontalPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    contentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function expectNoHorizontalOverflow(locator: Locator) {
  expect(await locator.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
}

test('Arc popovers stay operable at every viewport edge and contain their own scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 520 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./arc/');
  await page.evaluate(async () => { await document.fonts.ready; });

  const edgePlacements = [
    { vertical: 'top', horizontal: 'left' }, { vertical: 'top', horizontal: 'center' }, { vertical: 'top', horizontal: 'right' },
    { vertical: 'bottom', horizontal: 'left' }, { vertical: 'bottom', horizontal: 'center' }, { vertical: 'bottom', horizontal: 'right' },
    { vertical: 'center', horizontal: 'left' }, { vertical: 'center', horizontal: 'right' },
  ] as const;
  for (const { vertical, horizontal } of edgePlacements) {
    const { trigger, panel } = await placeAndOpenPopover(page, vertical, horizontal);
    await expectWithinViewport(page, '.arc-popover');
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }

  const { trigger, panel } = await placeAndOpenPopover(page, 'center', 'center');
  const compactRows = panel.getByRole('switch', { name: /Compact rows/ });
  await expect.poll(() => panel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await panel.getByText('Compact rows', { exact: true }).click();
  await expect(compactRows).toBeChecked();
  await expect(panel).toBeVisible();
  await expectWithinViewport(page, '.arc-popover');
  expect(await panel.evaluate((element) => getComputedStyle(element).overscrollBehaviorY)).toBe('contain');
  const pageScroll = await page.evaluate(() => window.scrollY);
  await panel.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const bounds = await panel.boundingBox();
  if (!bounds) throw new Error('Popover has no layout bounds');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(0, 400);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('Arc tooltips keep Arc theme context and stop nonessential motion in portals', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('./arc/#specimen-tooltip');
  const trigger = page.getByRole('button', { name: 'Download resource' });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip', { name: 'Download a local copy' });
  await expect(tooltip).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await tooltip.evaluate((element) => element.parentElement?.classList.contains('arc-root'))).toBe(true);
  expect(parseFloat(await tooltip.evaluate((element) => getComputedStyle(element).animationDuration))).toBeLessThanOrEqual(0.00001);
  const colors = await tooltip.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, foreground: style.color };
  });
  expect(colors.background).toBe('rgb(242, 230, 211)');
  expect(colors.foreground).toBe('rgb(33, 22, 37)');
  await page.keyboard.press('Tab');
  await expect(tooltip).toHaveCount(0);
});

test('Arc toasts stack by content height in one safe, reduced-motion notification region', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('./arc/#specimen-toast');

  await page.getByRole('button', { name: 'Show Success Toast' }).click();
  await page.getByRole('button', { name: 'Show review toast' }).click();
  await page.getByRole('button', { name: 'Show Reference Toast' }).click();

  const region = page.getByRole('region', { name: 'Notifications' });
  await expect(region).toHaveCount(1);
  await expect(region).toHaveClass(/arc-root/);
  const toasts = region.locator('.arc-toast');
  await expect(toasts).toHaveCount(3);
  await expect(toasts.filter({ hasText: 'You Saved Changes' })).toHaveRole('status');
  await expect(toasts.filter({ hasText: 'Related Reference Ready' })).toHaveRole('status');
  await expect(toasts.filter({ hasText: 'Complete Your Review' })).toHaveRole('alert');

  const rectangles = await toasts.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, viewportWidth: window.innerWidth };
  }));
  for (let index = 0; index < rectangles.length; index += 1) {
    const rect = rectangles[index];
    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(rect.viewportWidth + 1);
    if (index > 0) expect(rect.top).toBeGreaterThanOrEqual(rectangles[index - 1].bottom - 1);
  }

  const unbrokenMessage = toasts.filter({ hasText: 'ARCHIVALREFERENCE' }).locator('p');
  await expectNoHorizontalOverflow(unbrokenMessage);
  expect(parseFloat(await toasts.first().evaluate((element) => getComputedStyle(element).animationDuration))).toBeLessThanOrEqual(0.00001);
  expect(await region.evaluate((element) => getComputedStyle(element).overscrollBehaviorY)).toBe('contain');
  await expectWithinViewport(page, '.arc-toast-region');

  await page.evaluate(() => {
    document.documentElement.style.setProperty('--arc-safe-area-inset-right', '28px');
    document.documentElement.style.setProperty('--arc-safe-area-inset-bottom', '32px');
  });
  await expect(region).toHaveCSS('right', '28px');
  await expect(region).toHaveCSS('bottom', '32px');
  await expect(page.getByRole('button', { name: 'Show Reference Toast' })).toBeFocused();

  await toasts.filter({ hasText: 'You Saved Changes' }).getByRole('button', { name: 'Dismiss You Saved Changes' }).click();
  await expect(toasts).toHaveCount(2);
});

test('Arc cards and enlarged copy reflow while data tables retain intentional horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./arc/#specimen-card');
  await page.getByRole('button', { name: 'Read Summary Notes' }).click();
  await expect(page.locator('#specimen-card').getByText('ARCHIVECARDREFERENCE', { exact: false })).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });

  const card = page.locator('#specimen-card .arc-card').first();
  for (const selector of ['.arc-card__header', '.arc-card__content', '.arc-card__footer']) {
    await expectNoHorizontalOverflow(card.locator(selector));
  }

  const zoom = page.locator('.arc-zoom-demo');
  await expectNoHorizontalOverflow(zoom);
  const zoomText = await zoom.locator('span').evaluate((element) => ({
    whiteSpace: getComputedStyle(element).whiteSpace,
    width: element.getBoundingClientRect().width,
    parentWidth: element.parentElement?.getBoundingClientRect().width ?? 0,
  }));
  expect(zoomText.whiteSpace).toBe('normal');
  expect(zoomText.width).toBeLessThanOrEqual(zoomText.parentWidth + 1);

  const table = page.getByRole('region', { name: 'Resource register, scrollable table' });
  const tableScroll = await table.evaluate((element) => {
    element.scrollLeft = 80;
    return { scrollLeft: element.scrollLeft, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
  });
  expect(tableScroll.scrollWidth).toBeGreaterThan(tableScroll.clientWidth);
  expect(tableScroll.scrollLeft).toBeGreaterThan(0);
  await expectNoHorizontalPageOverflow(page);
});

test('Reading Room wraps user-authored long notes in both quotation placements', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./arc/reading-room/?view=notes');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);

  const longNote = `${'LIGHTGATHERINGQUIETROOM-'.repeat(7)} A long observation can remain legible without breaking the reading column.`;
  await page.getByRole('button', { name: 'Add a Note' }).click();
  const dialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
  await dialog.getByRole('textbox', { name: 'Your note' }).fill(longNote);
  await dialog.getByRole('button', { name: 'Save Note' }).click();

  const savedNote = page.locator('.arc-reading-room-note').first();
  await expect(savedNote.locator('blockquote')).toHaveText(longNote);
  await expectNoHorizontalOverflow(savedNote.locator('.arc-reading-room-note__body'));
  await expectNoHorizontalOverflow(savedNote.locator('blockquote'));
  await expectNoHorizontalPageOverflow(page);

  await page.getByRole('link', { name: 'Today', exact: true }).click();
  const recentQuotation = page.locator('.arc-reading-room-recent-note blockquote');
  await expect(recentQuotation).toHaveText(longNote);
  await expectNoHorizontalOverflow(recentQuotation);
  await expectNoHorizontalPageOverflow(page);
});

test('Reading Room wraps long book titles and authors without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('./arc/reading-room/?view=library');
  const card = page.locator('.arc-reading-room-book-card').first();
  const title = card.locator('h3');
  const author = card.locator('.arc-reading-room-book-card__author');
  await title.locator('button').evaluate((element) => { element.textContent = 'UNBROKENARCHIVALBOOKTITLE'.repeat(4); });
  await author.evaluate((element) => { element.textContent = 'UNBROKENARCHIVALAUTHORNAME'.repeat(4); });

  await expectNoHorizontalOverflow(title);
  await expectNoHorizontalOverflow(author);
  await expectNoHorizontalPageOverflow(page);
});

test('Arc dialogs respect safe usable space, wrap realistic content, and contain overscroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 520 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./arc/#specimen-dialog');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--arc-safe-area-inset-top', '28px');
    document.documentElement.style.setProperty('--arc-safe-area-inset-right', '20px');
    document.documentElement.style.setProperty('--arc-safe-area-inset-bottom', '32px');
    document.documentElement.style.setProperty('--arc-safe-area-inset-left', '16px');
  });

  const trigger = page.getByRole('button', { name: 'Create a Collection' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Create a Collection' });
  const backdrop = page.locator('.arc-dialog-backdrop');
  await expect(dialog).toBeVisible();
  await expect(backdrop).toHaveCSS('padding-top', '28px');
  await expect(backdrop).toHaveCSS('padding-right', '20px');
  await expect(backdrop).toHaveCSS('padding-bottom', '32px');
  await expect(backdrop).toHaveCSS('padding-left', '16px');
  await expectWithinViewport(page, '.arc-dialog');

  await dialog.locator('h2').evaluate((element) => {
    element.textContent = `Create a Collection ${'WITHOUTBREAKS-ARCHIVETITLE-'.repeat(3)}`;
  });
  await dialog.locator('.arc-dialog__description').evaluate((element) => {
    element.textContent = `A realistic long description for a collection of references, annotations, and reading notes. ${'WITHOUTBREAKS-ARCHIVEDESCRIPTION-'.repeat(3)}`;
  });
  const panel = page.locator('.arc-dialog');
  const dialogBounds = await panel.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
  });
  expect(dialogBounds.top).toBeGreaterThanOrEqual(27);
  expect(dialogBounds.right).toBeLessThanOrEqual(341);
  expect(dialogBounds.bottom).toBeLessThanOrEqual(489);
  expect(dialogBounds.left).toBeGreaterThanOrEqual(15);
  await expect(panel.locator('h2')).toHaveCSS('overflow-wrap', 'anywhere');
  await expect(panel.locator('.arc-dialog__description')).toHaveCSS('overflow-wrap', 'anywhere');
  await expect(panel.locator('.arc-dialog__body')).toHaveCSS('overflow-wrap', 'anywhere');
  await expect.poll(() => panel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  for (const selector of ['h2', '.arc-dialog__description', '.arc-dialog__body']) {
    await expectNoHorizontalOverflow(panel.locator(selector));
  }

  expect(await panel.evaluate((element) => getComputedStyle(element).overscrollBehaviorY)).toBe('contain');
  const pageScroll = await page.evaluate(() => window.scrollY);
  await panel.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const bounds = await panel.boundingBox();
  if (!bounds) throw new Error('Dialog has no layout bounds');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(0, 400);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
