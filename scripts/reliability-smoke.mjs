import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const PORT = Number(process.env.SMOKE_PORT ?? '9001');
const BASE_URL = process.env.SMOKE_BASE_URL ?? `http://localhost:${PORT}/#/`;
const DEV_URL = `${BASE_URL}${BASE_URL.includes('?') ? '&' : '?'}preview=dev`;

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for dev server at ${url}`);
}

function spawnDevServer() {
  const child = spawn('pnpm', ['dev', '-p', String(PORT)], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[dev] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[dev:err] ${chunk}`);
  });

  return child;
}

function stopProcess(child) {
  return new Promise((resolve) => {
    if (!child || child.killed || child.exitCode !== null) {
      resolve();
      return;
    }

    child.once('exit', () => resolve());
    child.kill('SIGTERM');

    setTimeout(() => {
      if (!child.killed && child.exitCode === null) {
        child.kill('SIGKILL');
      }
    }, 5000);
  });
}

async function selectQOption(page, fieldLabel, optionText) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.getByLabel(fieldLabel).click();
    const option = page.locator('.q-menu .q-item').filter({ hasText: optionText }).first();

    try {
      await option.waitFor({ timeout: 5000 });
      await option.click();
      return;
    } catch {
      // Retry once because Quasar menus can occasionally miss first render in CI-like environments.
    }
  }

  throw new Error(`Unable to select option "${optionText}" for field "${fieldLabel}".`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getEntityCardByTitle(page, title) {
  const titleMatcher = new RegExp(`^${escapeRegExp(title)}$`);
  const titleNode = page.locator('.text-subtitle1', { hasText: titleMatcher }).first();
  return titleNode.locator('xpath=ancestor::div[contains(@class,"q-card")][1]');
}

async function assertSearchPrefill(page, fieldLabel, expectedValue) {
  const input = page.getByLabel(fieldLabel);
  await input.waitFor({ timeout: 10000 });

  const startedAt = Date.now();
  const timeoutMs = 10000;

  while (Date.now() - startedAt < timeoutMs) {
    const actual = (await input.inputValue()).trim();
    if (actual === expectedValue) {
      return;
    }

    await page.waitForTimeout(200);
  }

  const actual = (await input.inputValue()).trim();
  throw new Error(`Expected ${fieldLabel} to be "${expectedValue}", but received "${actual}".`);
}

async function run() {
  const devServer = spawnDevServer();
  const tempDir = await mkdtemp(path.join(tmpdir(), 'job-hunt-smoke-'));

  const cleanUp = async () => {
    await stopProcess(devServer);
    await rm(tempDir, { recursive: true, force: true });
  };

  process.on('SIGINT', async () => {
    await cleanUp();
    process.exit(1);
  });

  process.on('SIGTERM', async () => {
    await cleanUp();
    process.exit(1);
  });

  try {
    await waitForServer(`http://localhost:${PORT}/`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const runId = Date.now().toString();

    const companyInitial = `Smoke Company ${runId}`;
    const companyUpdated = `${companyInitial} Updated`;
    const positionInitial = `Smoke Position ${runId}`;
    const positionUpdated = `${positionInitial} Updated`;
    const recruiterInitial = `Smoke Recruiter ${runId}`;
    const recruiterUpdated = `${recruiterInitial} Updated`;
    const nestedCompany = `Nested Company ${runId}`;
    const nestedRecruiter = `Nested Recruiter ${runId}`;
    const nestedRole = `Nested Role ${runId}`;
    const nestedAction = `Nested action ${runId}`;
    const linkedAction = `Smoke linked action ${runId}`;

    await page.goto(DEV_URL, { waitUntil: 'networkidle' });

    await page.evaluate(async () => {
      localStorage.removeItem('job-hunt-tracker-companies-v1');
      localStorage.removeItem('job-hunt-tracker-positions-v1');
      localStorage.removeItem('job-hunt-tracker-recruiters-v1');
      localStorage.removeItem('job-hunt-tracker-profile-v1');
      localStorage.removeItem('job-hunt-tracker-applications-backup-meta-v1');
      sessionStorage.clear();

      const req = indexedDB.deleteDatabase('job-hunt-tracker');
      await new Promise((resolve) => {
        req.onsuccess = () => resolve(null);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      });
    });

    await page.reload({ waitUntil: 'networkidle' });

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByRole('textbox', { name: 'Company' }).fill(`Nested draft company ${runId}`);
    await page.getByRole('textbox', { name: 'Role' }).fill(nestedRole);
    await page.getByLabel('Next action').fill(nestedAction);
    await page.getByRole('button', { name: 'Open recruiters' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/recruiters')}`), { timeout: 10000 });

    await page.getByLabel('Recruiting firm name').fill(nestedRecruiter);
    await page
      .getByPlaceholder('Add notes about the recruiting firm')
      .fill(`Nested recruiter note ${runId}`);
    await page.getByRole('button', { name: 'Create company' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/companies')}`), { timeout: 10000 });

    await page.getByLabel('Company name').fill(nestedCompany);
    await page.getByRole('button', { name: 'Save company' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/recruiters')}`), { timeout: 10000 });

    const hiringForCompanyValue = (
      await page.getByLabel('Hiring for company (optional)').inputValue()
    ).trim();
    if (!hiringForCompanyValue.includes(nestedCompany)) {
      throw new Error(
        `Expected nested recruiter to link company "${nestedCompany}", received "${hiringForCompanyValue}".`,
      );
    }

    await page.getByRole('button', { name: 'Save recruiting firm' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/applications')}`), { timeout: 10000 });

    const restoredCompany = (
      await page.getByRole('textbox', { name: 'Company' }).inputValue()
    ).trim();
    if (restoredCompany !== nestedCompany) {
      throw new Error(
        `Expected nested unwind company to be "${nestedCompany}", received "${restoredCompany}".`,
      );
    }

    const restoredRole = (await page.getByRole('textbox', { name: 'Role' }).inputValue()).trim();
    if (restoredRole !== nestedRole) {
      throw new Error(
        `Expected nested unwind role to be "${nestedRole}", received "${restoredRole}".`,
      );
    }

    const restoredAction = (await page.getByLabel('Next action').inputValue()).trim();
    if (restoredAction !== nestedAction) {
      throw new Error(
        `Expected nested unwind next action to be "${nestedAction}", received "${restoredAction}".`,
      );
    }

    const nestedRecruiterLinkedValue = (
      await page.getByLabel('Linked recruiter').inputValue()
    ).trim();
    if (!nestedRecruiterLinkedValue.includes(nestedRecruiter)) {
      throw new Error(
        `Expected nested unwind linked recruiter to include "${nestedRecruiter}", received "${nestedRecruiterLinkedValue}".`,
      );
    }

    await page.getByRole('button', { name: 'Save application' }).click();

    const nestedActionText = page.getByText(`Next: ${nestedAction}`, { exact: true });
    const nestedCard = nestedActionText.locator(
      'xpath=ancestor::div[contains(@class,"q-card")][1]',
    );
    await nestedCard.waitFor({ timeout: 10000 });
    await nestedCard
      .getByText(`Company: ${nestedCompany}`, { exact: true })
      .waitFor({ timeout: 10000 });

    await nestedCard.getByRole('button', { name: 'Delete' }).click();
    await nestedActionText.waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}recruiters?preview=dev`, { waitUntil: 'networkidle' });
    let nestedRecruiterCard = getEntityCardByTitle(page, nestedRecruiter);
    await nestedRecruiterCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(nestedRecruiter, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}companies?preview=dev`, { waitUntil: 'networkidle' });
    let nestedCompanyCard = getEntityCardByTitle(page, nestedCompany);
    await nestedCompanyCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(nestedCompany, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}companies?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByLabel('Company name').fill(companyInitial);
    await page.getByLabel('Website').fill('https://example.com');
    await page.getByRole('button', { name: 'Save company' }).click();
    await page.getByText(companyInitial, { exact: true }).waitFor({ timeout: 10000 });

    let companyCard = getEntityCardByTitle(page, companyInitial);
    await companyCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Company name').fill(companyUpdated);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText(companyUpdated, { exact: true }).waitFor({ timeout: 10000 });

    companyCard = getEntityCardByTitle(page, companyUpdated);
    await companyCard.getByRole('button', { name: 'View positions' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/positions')}`), { timeout: 10000 });
    await assertSearchPrefill(page, 'Search positions', companyUpdated);
    await page.getByLabel('Search positions').fill('');

    await page.goto(`${BASE_URL}companies?preview=dev`, { waitUntil: 'networkidle' });
    companyCard = getEntityCardByTitle(page, companyUpdated);
    await companyCard.getByRole('button', { name: 'View recruiters' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/recruiters')}`), { timeout: 10000 });
    await assertSearchPrefill(page, 'Search recruiting firms', companyUpdated);
    await page.getByLabel('Search recruiting firms').fill('');

    await page.goto(`${BASE_URL}companies?preview=dev`, { waitUntil: 'networkidle' });
    companyCard = getEntityCardByTitle(page, companyUpdated);
    await companyCard.getByRole('button', { name: 'View applications' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/applications')}`), { timeout: 10000 });
    await assertSearchPrefill(page, 'Search applications', companyUpdated);
    await page.getByLabel('Search applications').fill('');

    await page.goto(`${BASE_URL}positions?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByLabel('Position title').fill(positionInitial);
    await selectQOption(page, 'Company', companyUpdated);
    await page.getByRole('button', { name: 'Save position' }).click();
    await page.getByText(positionInitial, { exact: true }).waitFor({ timeout: 10000 });

    let positionCard = getEntityCardByTitle(page, positionInitial);
    await positionCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Position title').fill(positionUpdated);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText(positionUpdated, { exact: true }).waitFor({ timeout: 10000 });

    positionCard = getEntityCardByTitle(page, positionUpdated);
    await positionCard.getByRole('button', { name: 'View applications' }).click();
    await page.waitForURL(new RegExp(`${escapeRegExp('/applications')}`), { timeout: 10000 });
    await assertSearchPrefill(page, 'Search applications', positionUpdated);
    await page.getByLabel('Search applications').fill('');

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByRole('textbox', { name: 'Company' }).fill(companyUpdated);
    await selectQOption(page, 'Linked company', companyUpdated);
    await page.getByRole('textbox', { name: 'Role' }).fill(positionUpdated);
    await selectQOption(page, 'Linked position', positionUpdated);
    await page.getByLabel('Next action').fill(linkedAction);
    await page.getByRole('button', { name: 'Save application' }).click();

    const linkedActionText = page.getByText(`Next: ${linkedAction}`, { exact: true });
    const linkedCard = linkedActionText.locator(
      'xpath=ancestor::div[contains(@class,"q-card")][1]',
    );
    await linkedCard.waitFor({ timeout: 10000 });
    await linkedCard
      .getByText(`Company: ${companyUpdated}`, { exact: true })
      .waitFor({ timeout: 10000 });
    await linkedCard
      .getByText(`Position: ${positionUpdated}`, { exact: true })
      .waitFor({ timeout: 10000 });

    await linkedCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Company' }).fill(`Manual Drift Co ${runId}`);
    await page.getByRole('textbox', { name: 'Role' }).fill(`Manual Drift Role ${runId}`);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await linkedActionText.waitFor({ timeout: 10000 });

    await linkedCard.getByRole('button', { name: 'Edit' }).click();
    const canonicalCompany = (
      await page.getByRole('textbox', { name: 'Company' }).inputValue()
    ).trim();
    const canonicalRole = (await page.getByRole('textbox', { name: 'Role' }).inputValue()).trim();

    if (canonicalCompany !== companyUpdated) {
      throw new Error(
        `Expected linked company value to normalize to "${companyUpdated}", received "${canonicalCompany}".`,
      );
    }

    if (canonicalRole !== positionUpdated) {
      throw new Error(
        `Expected linked role value to normalize to "${positionUpdated}", received "${canonicalRole}".`,
      );
    }

    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.goto(`${BASE_URL}positions?preview=dev`, { waitUntil: 'networkidle' });
    positionCard = getEntityCardByTitle(page, positionUpdated);
    await positionCard.getByRole('button', { name: 'Delete' }).click();
    await page.getByText('Linked records found', { exact: false }).waitFor({ timeout: 10000 });
    await page.locator('.q-dialog').getByRole('button', { name: 'Cancel' }).click();
    await page.getByText(positionUpdated, { exact: true }).waitFor({ timeout: 10000 });

    await page.goto(`${BASE_URL}companies?preview=dev`, { waitUntil: 'networkidle' });
    companyCard = getEntityCardByTitle(page, companyUpdated);
    await companyCard.getByRole('button', { name: 'Delete' }).click();
    await page.getByText('Linked records found', { exact: false }).waitFor({ timeout: 10000 });
    await page.locator('.q-dialog').getByRole('button', { name: 'Cancel' }).click();
    await page.getByText(companyUpdated, { exact: true }).waitFor({ timeout: 10000 });

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await linkedCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(`Next: ${linkedAction}`, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}positions?preview=dev`, { waitUntil: 'networkidle' });
    positionCard = getEntityCardByTitle(page, positionUpdated);
    await positionCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(positionUpdated, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}companies?preview=dev`, { waitUntil: 'networkidle' });
    companyCard = getEntityCardByTitle(page, companyUpdated);
    await companyCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(companyUpdated, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}recruiters?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByLabel('Recruiting firm name').fill(recruiterInitial);
    await page.getByLabel('Website').fill(`https://smoke-${runId}.example.com`);
    await page.getByRole('button', { name: 'Save recruiting firm' }).click();
    await page.getByText(recruiterInitial, { exact: true }).waitFor({ timeout: 10000 });

    let recruiterCard = getEntityCardByTitle(page, recruiterInitial);
    await recruiterCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Recruiting firm name').fill(recruiterUpdated);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText(recruiterUpdated, { exact: true }).waitFor({ timeout: 10000 });

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByRole('textbox', { name: 'Company' }).fill(companyUpdated);
    await page.getByRole('textbox', { name: 'Role' }).fill(`Recruiter-linked role ${runId}`);
    await selectQOption(page, 'Linked recruiter', recruiterUpdated);
    const recruiterAction = `Recruiter linked action ${runId}`;
    await page.getByLabel('Next action').fill(recruiterAction);
    await page.getByRole('button', { name: 'Save application' }).click();

    const recruiterLinkedActionText = page.getByText(`Next: ${recruiterAction}`, { exact: true });
    const recruiterLinkedCard = recruiterLinkedActionText.locator(
      'xpath=ancestor::div[contains(@class,"q-card")][1]',
    );
    await recruiterLinkedCard.waitFor({ timeout: 10000 });
    await recruiterLinkedCard
      .getByText(`Recruiter: ${recruiterUpdated}`, { exact: true })
      .waitFor({ timeout: 10000 });

    await recruiterLinkedCard.getByRole('button', { name: 'Edit' }).click();
    const recruiterField = page.getByLabel('Linked recruiter');
    await recruiterField.click();
    const recruiterFieldValue = (await recruiterField.inputValue()).trim();
    if (!recruiterFieldValue.includes(recruiterUpdated)) {
      throw new Error(
        `Expected linked recruiter input to include "${recruiterUpdated}", received "${recruiterFieldValue}".`,
      );
    }
    await page.getByRole('button', { name: 'Cancel' }).click();

    await page.goto(`${BASE_URL}recruiters?preview=dev`, { waitUntil: 'networkidle' });
    recruiterCard = getEntityCardByTitle(page, recruiterUpdated);
    const recruiterRenamed = `${recruiterUpdated} Renamed`;
    await recruiterCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Recruiting firm name').fill(recruiterRenamed);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText(recruiterRenamed, { exact: true }).waitFor({ timeout: 10000 });

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await page
      .getByText(`Recruiter: ${recruiterRenamed}`, { exact: true })
      .waitFor({ timeout: 10000 });

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await recruiterLinkedActionText.waitFor({ timeout: 10000 });
    await recruiterLinkedCard
      .getByText(`Recruiter: ${recruiterRenamed}`, { exact: true })
      .waitFor({ timeout: 10000 });

    await recruiterLinkedCard.getByRole('button', { name: 'Delete' }).click();
    await recruiterLinkedActionText.waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}recruiters?preview=dev`, { waitUntil: 'networkidle' });
    recruiterCard = getEntityCardByTitle(page, recruiterRenamed);
    await recruiterCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(recruiterRenamed, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await page.goto(`${BASE_URL}applications?preview=dev`, { waitUntil: 'networkidle' });
    await page
      .getByText(`Recruiter: ${recruiterRenamed}`, { exact: true })
      .waitFor({ state: 'detached', timeout: 10000 });

    await browser.close();
    await cleanUp();

    process.stdout.write('\nReliability smoke test passed.\n');
  } catch (error) {
    await cleanUp();
    throw error;
  }
}

run().catch((error) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`\nReliability smoke test failed:\n${message}\n`);
  process.exit(1);
});
