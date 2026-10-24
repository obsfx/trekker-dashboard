import type { Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';
import { EPICS, SUBTASKS, TASKS, TOTAL_LIST_ITEMS } from '../support/seed';
import { chooseOption, dialog } from '../support/ui';

function resultRows(page: Page) {
  return page.locator('tbody').getByRole('row');
}

function rowById(page: Page, id: string) {
  return resultRows(page).filter({ has: page.getByRole('cell', { name: id, exact: true }) });
}

async function idColumn(page: Page): Promise<string[]> {
  return resultRows(page).locator('td:first-child').allTextContents();
}

test.describe('list page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/list');
    await expect(resultRows(page)).toHaveCount(20);
  });

  test('renders rows with type, status and priority', async ({ page }) => {
    await chooseOption(page, page.getByRole('combobox', { name: 'Items per page' }), '100');
    await expect(resultRows(page)).toHaveCount(TOTAL_LIST_ITEMS);

    const loginRow = rowById(page, TASKS.loginForm.id);
    await expect(loginRow.getByRole('cell').nth(1)).toHaveText('task');
    await expect(loginRow.getByRole('cell').nth(2)).toHaveText(TASKS.loginForm.title);
    await expect(loginRow.getByRole('cell').nth(3)).toHaveText('In Progress');
    await expect(loginRow.getByRole('cell').nth(4)).toHaveText('P1 - High');

    await expect(rowById(page, EPICS.auth.id).getByRole('cell').nth(1)).toHaveText('epic');
    await expect(rowById(page, SUBTASKS.emailValidation.id).getByRole('cell').nth(1)).toHaveText(
      'subtask'
    );
  });

  test('paginates and changes page size', async ({ page }) => {
    await expect(page.getByText(`Showing 1-20 of ${TOTAL_LIST_ITEMS}`)).toBeVisible();
    await expect(page.getByText('Page 1 of 3')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prev' })).toBeDisabled();
    const firstPageIds = await idColumn(page);

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Page 2 of 3')).toBeVisible();
    await expect(page.getByText(`Showing 21-40 of ${TOTAL_LIST_ITEMS}`)).toBeVisible();
    expect(await idColumn(page)).not.toEqual(firstPageIds);

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(
      page.getByText(`Showing 41-${TOTAL_LIST_ITEMS} of ${TOTAL_LIST_ITEMS}`)
    ).toBeVisible();
    await expect(resultRows(page)).toHaveCount(TOTAL_LIST_ITEMS - 40);
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();

    await page.getByRole('button', { name: 'Prev' }).click();
    await expect(page.getByText('Page 2 of 3')).toBeVisible();

    await chooseOption(page, page.getByRole('combobox', { name: 'Items per page' }), '50');
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(resultRows(page)).toHaveCount(50);
  });

  test('filters by entity type toggles', async ({ page }) => {
    await page.getByRole('button', { name: 'Epic', exact: true }).click();
    await expect(resultRows(page)).toHaveCount(3);
    expect((await idColumn(page)).sort()).toEqual(
      Object.values(EPICS)
        .map((epic) => epic.id)
        .sort()
    );

    await page.getByRole('button', { name: 'Subtask', exact: true }).click();
    await expect(resultRows(page)).toHaveCount(5);

    await page.getByRole('button', { name: 'Epic', exact: true }).click();
    await expect(resultRows(page)).toHaveCount(2);
    expect((await idColumn(page)).sort()).toEqual(
      Object.values(SUBTASKS)
        .map((subtask) => subtask.id)
        .sort()
    );
  });

  test('filters by status and priority', async ({ page }) => {
    await chooseOption(page, page.getByRole('combobox', { name: 'Status' }), "Won't Fix");
    await expect(resultRows(page)).toHaveCount(1);
    expect(await idColumn(page)).toEqual([TASKS.dropTables.id]);

    await chooseOption(page, page.getByRole('combobox', { name: 'Status' }), 'All Statuses');
    await chooseOption(page, page.getByRole('combobox', { name: 'Priority' }), 'P0 - Critical');
    await expect(resultRows(page)).toHaveCount(1);
    expect(await idColumn(page)).toEqual([TASKS.jwtRefresh.id]);

    await chooseOption(page, page.getByRole('combobox', { name: 'Priority' }), 'All Priorities');
    await chooseOption(page, page.getByRole('combobox', { name: 'Status' }), 'Archived');
    await expect(page.getByText('Showing 1-20 of 40')).toBeVisible();
  });

  test('sorts by title', async ({ page }) => {
    await chooseOption(page, page.getByRole('combobox', { name: 'Sort' }), 'Title (A-Z)');
    await expect(resultRows(page).first().getByRole('cell').nth(2)).toHaveText(
      TASKS.jwtRefresh.title
    );

    await chooseOption(page, page.getByRole('combobox', { name: 'Sort' }), 'Title (Z-A)');
    await expect(resultRows(page).first().getByRole('cell').nth(2)).toHaveText(
      TASKS.authDocs.title
    );

    await chooseOption(
      page,
      page.getByRole('combobox', { name: 'Sort' }),
      'Priority (high to low)'
    );
    await expect(resultRows(page).first().getByRole('cell').nth(0)).toHaveText(TASKS.jwtRefresh.id);
  });

  test('searches loaded rows by title or id', async ({ page }) => {
    await chooseOption(page, page.getByRole('combobox', { name: 'Items per page' }), '100');
    const search = page.getByPlaceholder('Search...');

    await search.fill('login');
    await expect(resultRows(page)).toHaveCount(1);
    expect(await idColumn(page)).toEqual([TASKS.loginForm.id]);

    await search.fill(EPICS.cleanup.id.toLowerCase());
    expect(await idColumn(page)).toEqual([EPICS.cleanup.id]);

    await search.fill('');
    await expect(resultRows(page)).toHaveCount(TOTAL_LIST_ITEMS);
  });

  test('clears active filters and search', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Clear' })).toBeHidden();
    await page.getByRole('button', { name: 'Task', exact: true }).click();
    await chooseOption(page, page.getByRole('combobox', { name: 'Status' }), 'Completed');
    await page.getByPlaceholder('Search...').fill('cron');
    await expect(resultRows(page)).toHaveCount(1);

    await page.getByRole('button', { name: 'Clear' }).click();

    await expect(page.getByPlaceholder('Search...')).toHaveValue('');
    await expect(page.getByText(`Showing 1-20 of ${TOTAL_LIST_ITEMS}`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear' })).toBeHidden();
  });

  test('opens task and epic details from rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Epic', exact: true }).click();
    await rowById(page, EPICS.reporting.id).click();
    await expect(dialog(page).getByRole('heading', { name: EPICS.reporting.title })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Epic', exact: true }).click();
    await page.getByRole('button', { name: 'Subtask', exact: true }).click();
    await rowById(page, SUBTASKS.passwordMeter.id).click();
    await expect(
      dialog(page).getByRole('heading', { name: SUBTASKS.passwordMeter.title })
    ).toBeVisible();
  });

  test('reflects edits made from the detail modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Subtask', exact: true }).click();
    await rowById(page, SUBTASKS.passwordMeter.id).click();
    await chooseOption(page, dialog(page).getByRole('combobox', { name: 'Status' }), 'Completed');
    await page.keyboard.press('Escape');

    await expect(rowById(page, SUBTASKS.passwordMeter.id).getByRole('cell').nth(3)).toHaveText(
      'Completed'
    );
  });
});
