#!/usr/bin/env node
// Test navigateur Playwright pour valider la production (front)
// Dépendances : npm i playwright

import { chromium } from 'playwright';

const FRONT_URL = process.env.FRONT_URL || 'https://israelgrowthventure.com';
const EXPECTED_TITLE = process.env.FRONT_EXPECTED_TITLE || 'Emergent | Fullstack App';
const TIMEOUT = parseInt(process.env.BROWSER_TIMEOUT || '30000', 10);

const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

page.on('pageerror', (err) => {
  pageErrors.push(err.message || String(err));
});

let status = null;
let title = '';
let bodyTextLength = 0;
let ok = false;
let detail = '';

try {
  const response = await page.goto(FRONT_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
  status = response?.status() ?? null;
  title = await page.title();
  bodyTextLength = await page.evaluate(() => document.body.innerText.trim().length);

  if (status !== 200) {
    detail = `Status HTTP ${status}`;
  } else if (!title || !title.toLowerCase().includes(EXPECTED_TITLE.toLowerCase())) {
    detail = `Titre inattendu: '${title}'`;
  } else if (bodyTextLength < 20) {
    detail = 'Page blanche (texte vide)';
  } else if (consoleErrors.length > 0) {
    detail = `Erreurs console: ${consoleErrors.join(' | ')}`;
  } else if (pageErrors.length > 0) {
    detail = `Exceptions page: ${pageErrors.join(' | ')}`;
  } else {
    ok = true;
    detail = 'Page affichée sans erreurs';
  }
} catch (err) {
  detail = `Exception: ${err.message || err}`;
} finally {
  await browser.close();
}

const summary = {
  check: 'frontend_browser',
  ok,
  status,
  title,
  bodyTextLength,
  consoleErrors,
  pageErrors,
  detail,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(ok ? 0 : 1);
