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
