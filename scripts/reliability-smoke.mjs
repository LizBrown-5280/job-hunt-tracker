import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
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
  await page.getByLabel(fieldLabel).click();
  const option = page.locator('.q-menu .q-item').filter({ hasText: optionText }).first();
  await option.waitFor({ timeout: 10000 });
  await option.click();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getEntityCardByTitle(page, title) {
  const titleMatcher = new RegExp(`^${escapeRegExp(title)}$`);
  const titleNode = page.locator('.text-subtitle1', { hasText: titleMatcher }).first();
  return titleNode.locator('xpath=ancestor::div[contains(@class,"q-card")][1]');
}

async function run() {
  const devServer = spawnDevServer();
  const tempDir = await mkdtemp(path.join(tmpdir(), 'job-hunt-smoke-'));
  const backupPath = path.join(tempDir, 'import-backup.json');

  const backupPayload = {
    version: 1,
    exportedAt: '2026-07-29T16:00:00.000Z',
    profile: { name: 'Backup Test' },
    applications: [
      {
        id: 'app-import-1',
        company: 'Nimbus Labs',
        role: 'Frontend Engineer',
        status: 'applied',
        notes: 'Imported from smoke test',
        nextAction: 'Schedule recruiter intro',
        followUpDate: '2026-08-02',
        isFavorite: true,
        favoriteRating: 4,
        previousFavoriteRating: 3,
        favoriteUpdatedAt: '2026-07-29T16:00:00.000Z',
        createdAt: '2026-07-20T12:00:00.000Z',
        updatedAt: '2026-07-29T16:00:00.000Z',
      },
    ],
  };

  await writeFile(backupPath, JSON.stringify(backupPayload, null, 2), 'utf8');

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
    const linkedAction = `Smoke linked action ${runId}`;

    await page.goto(DEV_URL, { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Export backup' }).click();
    await page.getByText('Backup exported at', { exact: false }).waitFor({ timeout: 10000 });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import backup' }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(backupPath);

    await page
      .getByText('Backup imported successfully.', { exact: false })
      .waitFor({ timeout: 10000 });
    await page.locator('text=Nimbus Labs').first().waitFor({ timeout: 10000 });

    await page.getByRole('button', { name: 'Dev tools' }).click();
    await page.getByRole('button', { name: 'Reset demo (keep profile)' }).click();
    await page
      .getByText('Demo data reset complete and profile preserved.', { exact: false })
      .waitFor({ timeout: 10000 });

    await page.getByRole('button', { name: 'Run core flow health check' }).click();
    await page.getByText('Health check passed (', { exact: false }).waitFor({ timeout: 15000 });

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

    await page.goto(`${BASE_URL}positions?preview=dev`, { waitUntil: 'networkidle' });
    await page.getByLabel('Position title').fill(positionInitial);
    await selectQOption(page, 'Company', companyUpdated);
    await page.getByLabel('Location').fill('Remote');
    await page.getByRole('button', { name: 'Save position' }).click();
    await page.getByText(positionInitial, { exact: true }).waitFor({ timeout: 10000 });

    let positionCard = getEntityCardByTitle(page, positionInitial);
    await positionCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Position title').fill(positionUpdated);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText(positionUpdated, { exact: true }).waitFor({ timeout: 10000 });

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
    await page.getByLabel('Full name').fill(recruiterInitial);
    await page.getByLabel('Email').fill(`smoke-${runId}@example.com`);
    await page.getByRole('button', { name: 'Save recruiter' }).click();
    await page.getByText(recruiterInitial, { exact: true }).waitFor({ timeout: 10000 });

    let recruiterCard = getEntityCardByTitle(page, recruiterInitial);
    await recruiterCard.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Full name').fill(recruiterUpdated);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText(recruiterUpdated, { exact: true }).waitFor({ timeout: 10000 });

    recruiterCard = getEntityCardByTitle(page, recruiterUpdated);
    await recruiterCard.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByText(recruiterUpdated, { exact: true })
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
