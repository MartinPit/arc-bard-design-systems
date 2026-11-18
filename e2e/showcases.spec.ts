import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const components = [
  'Button',
  'Icon Button',
  'Text Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio Group',
  'Switch',
  'Slider',
  'Tabs',
  'Dialog',
  'Popover',
  'Tooltip',
  'Toast',
  'Badge',
  'Avatar',
  'Card',
  'Table',
  'Pagination',
];

test('the Portal links to both showcases and back to itself', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Two visual languages.');

  await page.getByRole('link', { name: 'Explore Arc design system' }).click();
  await expect(page).toHaveURL(/\/arc\/$/);
  await expect(page.locator('[data-design-system="arc"]')).toBeVisible();

  await page.goto('./');
  await page.getByRole('link', { name: 'Explore Bard design system' }).click();
  await expect(page).toHaveURL(/\/bard\/$/);
  await expect(page.locator('[data-design-system="bard"]')).toBeVisible();
});

for (const system of ['arc', 'bard'] as const) {
  test(`${system} presents the complete component inventory`, async ({ page }) => {
    await page.goto(`./${system}/`);
    await expect(page.getByRole('heading', { level: 1, name: system === 'arc' ? 'Arc' : 'Bard' })).toBeVisible();

    for (const component of components) {
      await expect(page.getByRole('heading', { name: component, exact: true }), `${system}: ${component}`).toBeVisible();
    }
  });

  test(`${system} fits the viewport and supports keyboard navigation`, async ({ page }) => {
    await page.goto(`./${system}/`);

    const dimensions = await page.evaluate(() => ({
      contentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible')).toBeVisible();
  });

  test(`${system} overlays, switches, and toasts work in the production build`, async ({ page }) => {
    await page.goto(`./${system}/`);

    if (system === 'arc') {
      await page.getByRole('button', { name: 'Create a Collection' }).click();
      await expect(page.getByRole('dialog', { name: 'Create a Collection' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);

      const switchControl = page.getByRole('switch', { name: /Revision notifications/ });
      await expect(switchControl).toBeChecked();
      await page.locator('label.arc-switch').filter({ hasText: 'Revision notifications' }).click();
      await expect(switchControl).not.toBeChecked();

      await page.getByRole('button', { name: 'Show Success Toast' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'You Saved Changes' })).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss You Saved Changes' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'You Saved Changes' })).toHaveCount(0);
    } else {
      await page.getByRole('button', { name: 'Open dialog' }).click();
      await expect(page.getByRole('dialog', { name: 'Keep the whole composition in view.' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);

      const switchControl = page.getByRole('switch', { name: 'Ambient linework' });
      await expect(switchControl).toBeChecked();
      await switchControl.click();
      await expect(switchControl).not.toBeChecked();

      await page.getByRole('button', { name: 'Show confirmation' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Changes preserved' })).toBeVisible();
      await page.getByRole('button', { name: 'Dismiss notification' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Changes preserved' })).toHaveCount(0);
    }
  });

  test(`${system} has no detectable WCAG AA violations with reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./${system}/`);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }));
    expect(summary).toEqual([]);
  });

  test(`${system} dark mode follows the system, persists explicit choices, and meets WCAG AA`, async ({ page }) => {
    const lightModeLabel = system === 'arc' ? 'Switch to Light Mode' : 'Switch to light mode';
    const darkModeLabel = system === 'arc' ? 'Switch to Dark Mode' : 'Switch to dark mode';
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto(`./${system}/`);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: lightModeLabel })).toBeVisible();

    await page.getByRole('button', { name: lightModeLabel }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem(`${location.pathname.includes('/arc/') ? 'arc' : 'bard'}-theme`))).toBe('light');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: darkModeLabel }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const dimensions = await page.evaluate(() => ({
      contentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }));
    expect(summary).toEqual([]);
  });
}

test('arc tabs do not create vertical overflow or a scrollbar', async ({ page }) => {
  await page.goto('./arc/');
  const tabList = page.locator('.arc-tabs__list');
  const dimensions = await tabList.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);
});

test('the Portal has no detectable WCAG AA violations', async ({ page }) => {
  await page.goto('./');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test('the Portal dark mode persists and has no detectable WCAG AA violations', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('portal-theme'))).toBe('light');

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});
