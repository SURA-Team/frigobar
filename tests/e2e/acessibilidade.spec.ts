import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test('página inicial sem violações de acessibilidade', async ({ page }) => {
  await page.goto('./');
  const resultado = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(resultado.violations).toEqual([]);
});

test('detalhe do item aberto sem violações de acessibilidade', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Cerveja long neck/ }).click();
  await expect(page.locator('dialog.detalhe')).toBeVisible();
  const resultado = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(resultado.violations).toEqual([]);
});
