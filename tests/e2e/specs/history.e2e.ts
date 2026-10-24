import type { Page } from '@playwright/test';

import { expect, test } from '../support/fixtures';
import { COMMENTS, EPICS, TASKS, TOTAL_HISTORY_EVENTS } from '../support/seed';
import { chooseOption, dialog } from '../support/ui';

const HISTORY_PAGE_SIZE = 50;
const DAY_MS = 86_400_000;

function utcDate(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

function eventRows(page: Page) {
  return page.getByRole('article');
}

function eventRow(page: Page, entityId: string, action: string) {
  return page
    .getByRole('article')
    .filter({ has: page.getByRole('button', { name: entityId, exact: true }) })
    .filter({ hasText: action });
}

test.describe('history page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByText(/Showing 1-\d+ of \d+ events/)).toBeVisible();
  });

  test('lists seeded events with titles and paginates', async ({ page }) => {
    await expect(
      page.getByText(`Showing 1-${HISTORY_PAGE_SIZE} of ${TOTAL_HISTORY_EVENTS} events`)
    ).toBeVisible();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(eventRows(page)).toHaveCount(HISTORY_PAGE_SIZE);

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(
      page.getByText(
        `Showing ${HISTORY_PAGE_SIZE + 1}-${TOTAL_HISTORY_EVENTS} of ${TOTAL_HISTORY_EVENTS} events`
      )
    ).toBeVisible();
    await expect(eventRows(page)).toHaveCount(TOTAL_HISTORY_EVENTS - HISTORY_PAGE_SIZE);
    await expect(page.getByRole('main').getByText(EPICS.auth.title)).toBeVisible();

    await page.getByRole('button', { name: 'Prev' }).click();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
  });

  test('filters by entity type', async ({ page }) => {
    await chooseOption(page, page.getByRole('combobox', { name: 'Type' }), 'Comment');
    await expect(eventRows(page)).toHaveCount(2);
    for (const comment of Object.values(COMMENTS)) {
      await expect(page.getByRole('button', { name: comment.id, exact: true })).toBeDisabled();
    }

    await chooseOption(page, page.getByRole('combobox', { name: 'Type' }), 'Dependency');
    await expect(page.getByText('Showing 1-1 of 1 events')).toBeVisible();

    await chooseOption(page, page.getByRole('combobox', { name: 'Type' }), 'Epic');
    await expect(eventRows(page)).toHaveCount(3);

    await chooseOption(page, page.getByRole('combobox', { name: 'Type' }), 'All Types');
    await expect(page.getByText(`of ${TOTAL_HISTORY_EVENTS} events`)).toBeVisible();
  });

  test('filters by action and shows update diffs', async ({ page, project }) => {
    project.trekker(['task', 'update', TASKS.revenueChart.id, '-s', 'in_progress']);

    await chooseOption(page, page.getByRole('combobox', { name: 'Action' }), 'Updated');
    const updateRow = eventRow(page, TASKS.revenueChart.id, 'updated');
    await expect(updateRow).toBeVisible();
    await expect(updateRow.getByText('status:')).toBeVisible();
    await expect(updateRow.getByText('todo', { exact: true })).toBeVisible();
    await expect(updateRow.getByText('in_progress', { exact: true })).toBeVisible();

    await chooseOption(page, page.getByRole('combobox', { name: 'Action' }), 'Deleted');
    await expect(page.getByText('No events found')).toBeVisible();
  });

  test('marks deleted entities and disables their links', async ({ page, project }) => {
    project.trekker(['task', 'delete', TASKS.dropTables.id]);

    await chooseOption(page, page.getByRole('combobox', { name: 'Action' }), 'Deleted');
    const deleteRow = eventRow(page, TASKS.dropTables.id, 'deleted');
    await expect(deleteRow).toBeVisible();
    await expect(deleteRow.getByRole('button', { name: TASKS.dropTables.id })).toBeDisabled();
    await expect(deleteRow.getByText(TASKS.dropTables.title)).toHaveCSS(
      'text-decoration-line',
      'line-through'
    );
  });

  test('filters by date range', async ({ page }) => {
    const since = page.getByPlaceholder('Since');
    const until = page.getByPlaceholder('Until');

    await since.fill(utcDate(1));
    await expect(page.getByText('No events found')).toBeVisible();

    await since.fill(utcDate(-1));
    await expect(page.getByText(`of ${TOTAL_HISTORY_EVENTS} events`)).toBeVisible();

    await until.fill(utcDate(-1));
    await expect(page.getByText('No events found')).toBeVisible();

    await until.fill(utcDate(1));
    await expect(page.getByText(`of ${TOTAL_HISTORY_EVENTS} events`)).toBeVisible();
  });

  test('opens task and epic details from events', async ({ page }) => {
    await chooseOption(page, page.getByRole('combobox', { name: 'Type' }), 'Epic');
    await page.getByRole('button', { name: EPICS.reporting.id, exact: true }).click();
    await expect(dialog(page).getByRole('heading', { name: EPICS.reporting.title })).toBeVisible();
    await page.keyboard.press('Escape');

    await chooseOption(page, page.getByRole('combobox', { name: 'Type' }), 'Task');
    await page.getByRole('button', { name: TASKS.loginForm.id, exact: true }).click();
    await expect(dialog(page).getByRole('heading', { name: TASKS.loginForm.title })).toBeVisible();
  });
});
