import { expect, test } from '../support/fixtures';
import { PROJECT_NAME, TOTAL_EPICS, TOTAL_TASKS } from '../support/seed';

test.describe('app shell', () => {
  test('shows project name, navigation and entity totals', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'trekker' })).toBeVisible();
    await expect(page.getByText(PROJECT_NAME, { exact: true })).toBeVisible();
    await expect(page.getByText(`${TOTAL_TASKS} tasks across ${TOTAL_EPICS} epics`)).toBeVisible();
    await expect(page.getByText('Connected to live updates')).toBeVisible();
  });

  test('navigates between kanban, list and history', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation').first();

    await nav.getByRole('link', { name: 'List' }).click();
    await expect(page).toHaveURL(/\/list$/);
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByText('Connected to live updates')).toBeHidden();

    await nav.getByRole('link', { name: 'History' }).click();
    await expect(page).toHaveURL(/\/history$/);
    await expect(page.getByText(/Showing 1-\d+ of \d+ events/)).toBeVisible();

    await nav.getByRole('link', { name: 'Kanban' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('region', { name: 'TODO', exact: true })).toBeVisible();
  });

  for (const path of ['/list', '/history']) {
    test(`serves ${path} on direct load`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('link', { name: 'Kanban' })).toBeVisible();
      await expect(page.getByText(/Showing 1-/)).toBeVisible();
    });
  }

  test('toggles theme and persists it across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/\blight\b/);

    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(html).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);

    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(html).toHaveClass(/\blight\b/);
  });

  test('requests browser notification permission', async ({ page }) => {
    await page.addInitScript(() => {
      let permission: NotificationPermission = 'default';
      Object.defineProperty(Notification, 'permission', { get: () => permission });
      Notification.requestPermission = () => {
        permission = 'granted';
        return Promise.resolve(permission);
      };
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'Click to enable browser notifications' }).click();

    await expect(page.getByRole('button', { name: /Browser notifications enabled/ })).toBeVisible();
  });

  test('shows blocked notification state when permission is denied', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Notification, 'permission', { get: () => 'denied' });
    });
    await page.goto('/');

    await expect(
      page.getByRole('button', { name: 'Notifications blocked. Enable in browser settings.' })
    ).toBeDisabled();
  });
});
