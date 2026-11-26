/**
 * Gerador de QR code (US4) sobre o conteúdo de tests/fixtures (enderecoDefinitivo: false).
 */
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const URL_PUBLICA = 'https://sura-team.github.io/frigobar/';

test.beforeEach(async ({ page }) => {
  await page.goto('./admin/qrcode.html');
});

test('mostra o endereço codificado e o aviso de endereço provisório', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'QR code do frigobar' })).toBeVisible();
  await expect(page.getByText(URL_PUBLICA, { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Endereço provisório');
  await expect(page.getByRole('img', { name: `QR code que abre ${URL_PUBLICA}` })).toBeVisible();
});

test('baixa o QR code em SVG', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /Baixar SVG/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('qrcode-sura-team-github-io-frigobar.svg');
  const conteudo = await readFile((await download.path())!, 'utf8');
  expect(conteudo).toMatch(/^<svg[\s\S]*<\/svg>\s*$/);
});

test('baixa o QR code em PNG 2048×2048', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /Baixar PNG 2048×2048/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('qrcode-sura-team-github-io-frigobar.png');
  const bytes = await readFile((await download.path())!);
  // Assinatura PNG e dimensões no cabeçalho IHDR.
  expect(bytes.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  expect(bytes.readUInt32BE(16)).toBe(2048);
  expect(bytes.readUInt32BE(20)).toBe(2048);
});

test('página do QR code sem violações de acessibilidade', async ({ page }) => {
  await expect(page.getByRole('link', { name: /Baixar SVG/ })).toBeVisible();
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
});
