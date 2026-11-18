import { expect, test } from '@playwright/test';

test('Arc exposes meaningful semantics while decorative artwork stays hidden', async ({ page }) => {
  await page.goto('./arc/');

  const gradient = page.getByRole('img', { name: 'Arc accent gradient, marigold through orange and coral to magenta' });
  await expect(gradient).toBeVisible();
  await expect(gradient).toHaveAccessibleDescription('EXPRESSIVE PRINT / USE SPARINGLY');
  const typeScale = page.getByRole('list', { name: 'Recommended type scale' });
  await expect(typeScale.getByRole('listitem')).toHaveCount(6);
  await expect(page.getByRole('navigation', { name: 'Component index' }).getByRole('link')).toHaveCount(19);
  await expect(page.locator('.arc-shape-study__leaf')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.arc-motion-proof')).toHaveAttribute('aria-hidden', 'true');
});

test('Arc inputs emphasize keyboard focus and skip destinations keep a visible focus indicator', async ({ page }) => {
  await page.goto('./arc/');

  const email = page.getByRole('textbox', { name: 'Email address' });
  await email.focus();
  await expect(email).toBeFocused();
  await page.keyboard.press('Tab');
  const keyboardInput = page.getByRole('textbox', { name: 'Resource title' });
  await expect(keyboardInput).toBeFocused();
  await expect(keyboardInput).toBeVisible();
  expect(await keyboardInput.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');

  await page.goto('./arc/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to design system content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  const content = page.getByRole('main');
  await expect(content).toBeFocused();
  await expect(content).toHaveCSS('outline-style', 'solid');

  const brand = page.getByRole('link', { name: 'Arc, back to top' });
  await brand.focus();
  await page.keyboard.press('Enter');
  const top = page.locator('#top');
  await expect(top).toBeFocused();
  await expect(top).toHaveCSS('outline-style', 'solid');
});

test('Arc section-brand and footer links provide distinct hover feedback', async ({ page }) => {
  await page.goto('./arc/');

  const brand = page.getByRole('link', { name: 'Arc, back to top' });
  const brandColor = await brand.evaluate((element) => getComputedStyle(element).color);
  await brand.hover();
  await expect.poll(() => brand.evaluate((element) => getComputedStyle(element).color)).not.toBe(brandColor);

  const footer = page.getByRole('link', { name: 'Return to the Beginning' });
  const footerColor = await footer.evaluate((element) => getComputedStyle(element).color);
  await footer.hover();
  await expect.poll(() => footer.evaluate((element) => getComputedStyle(element).color)).not.toBe(footerColor);
});

test('Arc reviewed transitions and keyframes stay compositor-friendly without breaking motion controls', async ({ page }) => {
  await page.goto('./arc/');

  const nonCompositedTransitions = await page.locator('.arc-root *').evaluateAll((elements) => elements.flatMap((element) => {
    return [null, '::before', '::after'].flatMap((pseudo) => {
      const style = getComputedStyle(element, pseudo);
      const properties = style.transitionProperty.split(',').map((property) => property.trim());
      const durations = style.transitionDuration.split(',').map((duration) => duration.trim());
      return properties.filter((property, index) => {
        const duration = durations[index] ?? durations.at(-1);
        return duration && !['0s', '0ms'].includes(duration) && !['transform', 'opacity'].includes(property);
      }).map((property) => ({ selector: element.className, pseudo, property }));
    });
  }));
  expect(nonCompositedTransitions).toEqual([]);

  const saveButton = page.getByRole('button', { name: 'Save Changes', exact: true });
  const readButtonStyle = () => saveButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, shadow: style.boxShadow };
  });
  const restingButtonStyle = await readButtonStyle();
  await saveButton.hover();
  await expect.poll(async () => (await readButtonStyle()).background).not.toBe(restingButtonStyle.background);
  await expect.poll(async () => (await readButtonStyle()).shadow).not.toBe(restingButtonStyle.shadow);

  await page.getByRole('link', { name: /Motion/ }).hover();
  const inkOrigin = await page.locator('.arc-motion-proof__ink').evaluate((element) => getComputedStyle(element).transformOrigin);
  await page.getByRole('button', { name: 'Replay impression' }).click();
  expect(await page.locator('.arc-motion-proof__ink').evaluate((element) => getComputedStyle(element).transformOrigin)).toBe(inkOrigin);

  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.arc-motion-stage__meta')).toContainText('PAUSED');
  await expect(page.locator('.arc-motion-proof')).not.toHaveClass(/is-playing/);
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('.arc-motion-proof')).toHaveClass(/is-playing/);
});

test('Arc links use manipulation touch behavior and overscroll matches pointer precision', async ({ page }, testInfo) => {
  await page.goto('./arc/');

  const touchActions = await page.locator('.arc-root a').evaluateAll((links) => links.map((link) => getComputedStyle(link).touchAction));
  expect(touchActions.length).toBeGreaterThan(0);
  expect(new Set(touchActions)).toEqual(new Set(['manipulation']));

  const expectedOverscroll = testInfo.project.name === 'desktop-chromium' ? 'none' : 'auto';
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehavior)).toBe(expectedOverscroll);
});

test('Arc preserves visible focus and hover feedback in forced-colors mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('./arc/');

  const skip = page.getByRole('link', { name: 'Skip to design system content' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS('outline-style', 'solid');
  expect(await skip.evaluate((element) => getComputedStyle(element).outlineWidth)).not.toBe('0px');

  const brand = page.getByRole('link', { name: 'Arc, back to top' });
  await brand.hover();
  await expect(brand).toHaveCSS('text-decoration-line', 'underline');

  const footer = page.getByRole('link', { name: 'Return to the Beginning' });
  await footer.hover();
  await expect(footer).toHaveCSS('text-decoration-thickness', '2px');
});
