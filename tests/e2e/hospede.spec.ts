/**
 * Jornada do hóspede (US1, cenários 1–8) sobre o conteúdo de tests/fixtures/content.
 */
import { expect, test, type Page } from '@playwright/test';

const secao = (page: Page, slug: string) => page.locator(`[id="cat/${slug}"]`);
const dialogo = (page: Page) => page.locator('dialog.detalhe');

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('abre sem login e mostra as categorias na ordem do catálogo (cenário 1)', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Andrade Hotéis' })).toBeVisible();
  const titulos = page.locator('main section h2');
  await expect(titulos).toHaveText(['Bebidas', 'Snacks', 'Chocolates']);
});

test('formata preços em reais e preço zero como Cortesia (cenário 2)', async ({ page }) => {
  const cerveja = page.getByRole('button', { name: /Cerveja long neck/ });
  await expect(cerveja).toContainText('R$ 14,50');
  await expect(page.getByRole('button', { name: /Bombom de boas-vindas/ })).toContainText(
    'Cortesia',
  );
});

test('atalho de categoria leva até ela (cenário 3)', async ({ page }) => {
  await page
    .getByRole('navigation', { name: 'Categorias' })
    .getByRole('link', { name: 'Chocolates' })
    .click();
  await expect(secao(page, 'chocolates')).toBeInViewport();
  await expect(page).toHaveURL(/#cat\/chocolates$/);
});

test('não exibe item oculto (cenário 4)', async ({ page }) => {
  await expect(page.getByText('Suco de uva integral')).toHaveCount(0);
});

test('item sem foto mostra o ícone da categoria (cenário 5)', async ({ page }) => {
  const refrigerante = page.getByRole('button', { name: /Refrigerante lata/ });
  await expect(refrigerante.getByTestId('sem-foto')).toBeVisible();
  await expect(refrigerante.locator('img')).toHaveCount(0);
});

test('aviso de álcool uma vez na categoria e também no detalhe (cenário 6)', async ({ page }) => {
  const aviso = 'Venda proibida para menores de 18 anos. Beba com moderação.';
  await expect(secao(page, 'bebidas').getByRole('note')).toHaveCount(1);
  await expect(page.locator('main').getByText(aviso)).toHaveCount(1);
  await expect(secao(page, 'snacks').getByRole('note')).toHaveCount(0);

  await page.getByRole('button', { name: /Cerveja long neck/ }).click();
  await expect(dialogo(page)).toBeVisible();
  await expect(dialogo(page).getByRole('note')).toHaveText(aviso);
  await expect(dialogo(page).getByText('Alcoólico')).toBeVisible();
});

test('detalhe abre ao tocar e "voltar" retorna à mesma posição (cenário 7)', async ({ page }) => {
  const item = page.getByRole('button', { name: /Chocolate 70% cacau/ });
  await item.scrollIntoViewIfNeeded();
  const posicao = await page.evaluate(() => window.scrollY);
  expect(posicao).toBeGreaterThan(0);

  await item.click();
  await expect(dialogo(page)).toBeVisible();
  await expect(page).toHaveURL(/#item\/chocolate-70-cacau-80-g$/);
  await expect(dialogo(page)).toContainText('Conservar em local fresco e seco.');

  await page.goBack();
  await expect(dialogo(page)).toBeHidden();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - posicao)).toBeLessThanOrEqual(2);
  await expect(item).toBeFocused();
});

test('botão Fechar e Esc fecham o detalhe', async ({ page }) => {
  await page.getByRole('button', { name: /Batata chips/ }).click();
  await expect(dialogo(page)).toBeVisible();
  await dialogo(page).getByRole('button', { name: 'Fechar' }).click();
  await expect(dialogo(page)).toBeHidden();

  await page.getByRole('button', { name: /Batata chips/ }).click();
  await expect(dialogo(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogo(page)).toBeHidden();
  await expect(page).not.toHaveURL(/#item\//);
});

test('só os contatos preenchidos aparecem (cenário 8)', async ({ page }) => {
  const contatos = page.getByRole('region', { name: 'Fale com a recepção' });
  await expect(contatos.getByRole('link', { name: 'Conversar no WhatsApp' })).toHaveAttribute(
    'href',
    'https://wa.me/5551999998888',
  );
  await expect(contatos.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(contatos.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(contatos).toContainText('disque o ramal 9');
  await expect(contatos.getByText('9', { exact: true })).not.toHaveAttribute('href');
});

test('sem rolagem horizontal em 360px', async ({ page }) => {
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(360);
  await page.getByRole('button', { name: /Chocolate 70% cacau/ }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('link direto para um item abre o detalhe e "voltar" permanece no site', async ({ page }) => {
  await page.goto('./#item/cerveja-long-neck');
  await expect(dialogo(page)).toBeVisible();
  await expect(dialogo(page).getByRole('heading', { name: 'Cerveja long neck' })).toBeVisible();

  await page.goBack();
  await expect(dialogo(page)).toBeHidden();
  expect(new URL(page.url()).pathname).toBe('/frigobar/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('link para item inexistente mostra a página normal', async ({ page }) => {
  await page.goto('./#item/nao-existe');
  await expect(dialogo(page)).toBeHidden();
  await expect(page.locator('main section h2')).toHaveCount(3);
});
