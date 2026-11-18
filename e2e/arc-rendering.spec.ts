import { expect, test } from '@playwright/test';

test('Arc production entries preload only their critical Latin variable fonts', async ({ page }) => {
  for (const path of ['./arc/', './arc/reading-room/']) {
    const responses = new Map<string, number>();
    const onResponse = (response: { url: () => string; status: () => number }) => {
      if (response.url().endsWith('.woff2')) responses.set(response.url(), response.status());
    };
    page.on('response', onResponse);

    await page.goto(path);
    await page.evaluate(async () => { await document.fonts.ready; });

    const preloads = page.locator('link[rel="preload"][as="font"]');
    await expect(preloads).toHaveCount(2);
    const links = await preloads.evaluateAll((elements) => elements.map((link) => ({
      href: (link as HTMLLinkElement).href,
      type: link.getAttribute('type'),
      crossOrigin: link.getAttribute('crossorigin'),
    })));
    const hrefs = links.map(({ href }) => href);
    for (const link of links) {
      expect(link.type).toBe('font/woff2');
      expect(link.crossOrigin).toBe('');
    }

    expect(hrefs.some((href) => /fraunces-latin-wght-normal-[^/]+\.woff2$/.test(href))).toBe(true);
    expect(hrefs.some((href) => /inter-latin-wght-normal-[^/]+\.woff2$/.test(href))).toBe(true);
    for (const href of hrefs) {
      const url = new URL(href);
      expect(url.origin).toBe(new URL(page.url()).origin);
      expect(url.pathname).toMatch(/^\/arc-bard-design-systems\/assets\//);
      expect([200, 304]).toContain(responses.get(href));
    }

    const fonts = await page.evaluate(() => ({
      bodyFamily: getComputedStyle(document.querySelector('.arc-root')!).fontFamily,
      headingFamily: getComputedStyle(document.querySelector('h1')!).fontFamily,
      faces: Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
        .filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule)
        .map((rule) => ({ family: rule.style.fontFamily, display: rule.style.fontDisplay, source: rule.style.getPropertyValue('src') })),
    }));
    expect(fonts.bodyFamily).toContain('Inter Variable');
    expect(fonts.headingFamily).toContain('Fraunces Variable');
    for (const href of hrefs) {
      const fileName = new URL(href).pathname.split('/').pop()!;
      const face = fonts.faces.find((candidate) => candidate.source.includes(fileName.split('-').slice(0, 4).join('-')));
      expect(face?.display).toBe('swap');
    }

    page.off('response', onResponse);
  }
});

test('Arc Tables paginate beyond 50 rows while retaining native semantics', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('./arc/#specimen-table');

  const region = page.getByRole('region', { name: 'Resource register, scrollable table' });
  await expect(region.getByRole('row')).toHaveCount(4);
  await page.getByRole('button', { name: 'Show 51 Resource Rows' }).click();

  const table = region.getByRole('table', { name: 'Resource register' });
  await expect(table).toBeVisible();
  await expect(region.getByRole('row')).toHaveCount(51);
  await expect(region.getByRole('rowheader')).toHaveCount(50);
  await expect(region.getByRole('columnheader')).toHaveCount(5);
  await expect(region.getByRole('rowheader', { name: /Catalogue of garden letters/ })).toHaveCount(0);
  await page.locator('#specimen-table').getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: 'Page 2' }).click();
  await expect(region.getByRole('row')).toHaveCount(2);
  await expect(region.getByRole('rowheader', { name: /Catalogue of garden letters/ })).toBeAttached();
  expect(new URL(page.url()).searchParams.get('resource-register-page')).toBe('2');
  expect(new URL(page.url()).hash).toBe('#specimen-table');

  await page.reload();
  await page.getByRole('button', { name: 'Show 51 Resource Rows' }).click();
  await expect(region.getByRole('rowheader', { name: /Catalogue of garden letters/ })).toBeAttached();
  const pagination = page.locator('#specimen-table').getByRole('navigation', { name: 'Pagination' });
  await pagination.getByRole('link', { name: 'Page 1' }).click();
  await expect(region.getByRole('row')).toHaveCount(51);
  expect(new URL(page.url()).searchParams.has('resource-register-page')).toBe(false);
  await pagination.getByRole('link', { name: 'Page 2' }).click();
  await page.goBack();
  await expect(region.getByRole('row')).toHaveCount(51);
  await page.goForward();
  await expect(region.getByRole('row')).toHaveCount(2);

  const lastRow = region.getByRole('row').last();
  await lastRow.scrollIntoViewIfNeeded();
  const entries = lastRow.locator('td').last();
  await expect(entries).toHaveCSS('text-align', 'right');
  await expect(entries).toHaveCSS('font-variant-numeric', 'tabular-nums');

  await region.focus();
  await expect(region).toBeFocused();
  const initialScrollLeft = await region.evaluate((element) => element.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(initialScrollLeft);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);

  await page.getByRole('button', { name: 'Show Empty Table State' }).click();
  await expect(region.getByRole('cell', { name: /No resources match this view/ })).toHaveAttribute('colspan', '5');
  await expect(region.getByRole('rowheader')).toHaveCount(0);
});

test('Reading Room contains rendering for long note collections without reordering entries', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./arc/reading-room/?view=notes');

  const notes = page.getByRole('article');
  await expect(notes).toHaveCount(3);
  await expect(notes.first()).toHaveCSS('content-visibility', 'visible');

  async function addNote(index: number) {
    await page.getByRole('button', { name: 'Add a Note' }).click();
    const dialog = page.getByRole('dialog', { name: 'Press a Thought into the Margin' });
    await dialog.getByRole('textbox', { name: 'Your note' }).fill(`Observation ${index}: the margin held a useful thought about light, attention, and returning to the page.`);
    await dialog.getByRole('button', { name: 'Save Note' }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole('button', { name: 'Dismiss You Pressed a Note into the Margin' }).click();
  }

  for (let index = 4; index <= 50; index += 1) await addNote(index);
  await expect(notes).toHaveCount(50);
  await expect(notes.first()).toHaveCSS('content-visibility', 'visible');
  await addNote(51);

  await expect(notes).toHaveCount(51);
  await expect(notes.first().getByText(/Observation 51:/)).toBeAttached();
  await expect(notes.last().getByText('An ending that makes repair feel possible without making it feel easy.')).toBeAttached();
  await expect(notes.first().getByText('01', { exact: true })).toBeAttached();
  await expect(notes.last().getByText('51', { exact: true })).toBeAttached();
  await expect(notes.last()).toHaveCSS('content-visibility', 'auto');
  await notes.last().scrollIntoViewIfNeeded();
  await expect(notes.last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
});
