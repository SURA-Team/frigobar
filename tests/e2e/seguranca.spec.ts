import { expect, test } from '@playwright/test';

test('página pública com CSP e sem erros no console', async ({ page }) => {
  const erros: string[] = [];
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  page.on('pageerror', (e) => erros.push(String(e)));

  await page.goto('./');
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
    'content',
    /script-src 'self'/,
  );
  // Exercita imagens, fontes e o detalhe do item sob a CSP.
  await page.getByRole('button', { name: /Cerveja long neck/ }).click();
  await expect(page.locator('dialog.detalhe')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  expect(erros).toEqual([]);
});

test('a imagem do topo é pré-carregada no HTML', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveAttribute(
    'href',
    /\/frigobar\/_img\/.+\.webp$/,
  );
});
