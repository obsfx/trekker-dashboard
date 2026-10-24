import type { Locator } from '@playwright/test';

import { expect, test } from '../support/fixtures';
import { EPICS, NEXT_TASK_ID, SUBTASKS, TASKS } from '../support/seed';
import { dialog, epicCard, kanbanColumn, taskCard, toast } from '../support/ui';

function columnEntityIds(column: Locator): Promise<string[]> {
  return column
    .locator('[data-epic-id], [data-task-id]')
    .evaluateAll((cards) =>
      cards.map(
        (card) => card.getAttribute('data-epic-id') ?? card.getAttribute('data-task-id') ?? ''
      )
    );
}

test.describe('kanban board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(taskCard(page, TASKS.loginForm.id)).toBeVisible();
  });

  test('groups top-level epics and tasks by status', async ({ page }) => {
    const expectedColumns = {
      TODO: [EPICS.reporting.id, TASKS.jwtRefresh.id, TASKS.revenueChart.id],
      'In Progress': [EPICS.auth.id, TASKS.loginForm.id],
      Completed: [EPICS.cleanup.id, TASKS.authDocs.id, TASKS.cronJobs.id],
      "Won't Fix": [TASKS.dropTables.id],
    };

    for (const [label, ids] of Object.entries(expectedColumns)) {
      const column = kanbanColumn(page, label);
      await expect(column.getByText(String(ids.length), { exact: true }).first()).toBeVisible();
      expect((await columnEntityIds(column)).sort()).toEqual([...ids].sort());
    }

    await expect(taskCard(page, SUBTASKS.emailValidation.id)).toHaveCount(0);
    await expect(page.getByText('Backlog item 01')).toHaveCount(0);
  });

  test('renders task card details', async ({ page }) => {
    const loginCard = taskCard(page, TASKS.loginForm.id);
    await expect(loginCard.getByRole('heading', { name: TASKS.loginForm.title })).toBeVisible();
    await expect(
      loginCard.getByText(`P${TASKS.loginForm.priority}`, { exact: true })
    ).toBeVisible();
    await expect(loginCard.getByText(EPICS.auth.title)).toBeVisible();
    await expect(loginCard.getByText('frontend', { exact: true })).toBeVisible();
    await expect(loginCard.getByText('auth', { exact: true })).toBeVisible();
    await expect(loginCard.getByTitle(`Blocks ${TASKS.jwtRefresh.id}`)).toBeVisible();
    await expect(loginCard.getByText('1/2', { exact: true })).toBeVisible();

    const jwtCard = taskCard(page, TASKS.jwtRefresh.id);
    await expect(jwtCard.getByTitle(`Depends on ${TASKS.loginForm.id}`)).toBeVisible();
    await expect(jwtCard.getByText(TASKS.jwtRefresh.description)).toBeVisible();
  });

  test('renders epic card progress', async ({ page }) => {
    const authEpic = epicCard(page, EPICS.auth.id);
    await expect(authEpic.getByRole('heading', { name: EPICS.auth.title })).toBeVisible();
    await expect(authEpic.getByText('1/3 tasks')).toBeVisible();
    await expect(authEpic.getByText('33%')).toBeVisible();
    await expect(authEpic.getByRole('progressbar')).toBeVisible();

    const cleanupEpic = epicCard(page, EPICS.cleanup.id);
    await expect(cleanupEpic.getByText('0/0 tasks')).toBeVisible();
    await expect(cleanupEpic.getByRole('progressbar')).toHaveCount(0);
  });

  test('sorts a column by title and priority', async ({ page }) => {
    const completed = kanbanColumn(page, 'Completed');
    await completed.getByTitle('Sort & filter').click();
    const sortSelect = completed.getByRole('combobox', { name: 'Sort by' });

    await sortSelect.selectOption({ label: 'Title (A-Z)' });
    expect(await columnEntityIds(completed)).toEqual([
      EPICS.cleanup.id,
      TASKS.cronJobs.id,
      TASKS.authDocs.id,
    ]);

    await sortSelect.selectOption({ label: 'Title (Z-A)' });
    expect(await columnEntityIds(completed)).toEqual([
      EPICS.cleanup.id,
      TASKS.authDocs.id,
      TASKS.cronJobs.id,
    ]);

    const todo = kanbanColumn(page, 'TODO');
    await todo.getByTitle('Sort & filter').click();
    const todoSort = todo.getByRole('combobox', { name: 'Sort by' });

    await todoSort.selectOption({ label: 'Priority (high to low)' });
    expect(await columnEntityIds(todo)).toEqual([
      EPICS.reporting.id,
      TASKS.jwtRefresh.id,
      TASKS.revenueChart.id,
    ]);

    await todoSort.selectOption({ label: 'Priority (low to high)' });
    expect(await columnEntityIds(todo)).toEqual([
      EPICS.reporting.id,
      TASKS.revenueChart.id,
      TASKS.jwtRefresh.id,
    ]);
  });

  test('filters a column by entity type and resets', async ({ page }) => {
    const todo = kanbanColumn(page, 'TODO');
    await todo.getByTitle('Sort & filter').click();
    const showSelect = todo.getByRole('combobox', { name: 'Show' });

    await showSelect.selectOption({ label: 'Epics only' });
    expect(await columnEntityIds(todo)).toEqual([EPICS.reporting.id]);

    await showSelect.selectOption({ label: 'Tasks only' });
    expect((await columnEntityIds(todo)).sort()).toEqual(
      [TASKS.jwtRefresh.id, TASKS.revenueChart.id].sort()
    );

    await todo.getByRole('button', { name: 'Reset' }).click();
    await expect(todo.getByRole('combobox', { name: 'Show' })).toBeHidden();
    expect(await columnEntityIds(todo)).toHaveLength(3);
  });

  test('archives all completed items after confirmation', async ({ page, project }) => {
    const completed = kanbanColumn(page, 'Completed');

    await completed.getByTitle('Archive all completed items').click();
    await expect(
      dialog(page).getByRole('heading', { name: 'Archive All Completed' })
    ).toBeVisible();
    await dialog(page).getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog(page)).toBeHidden();
    expect(await columnEntityIds(completed)).toHaveLength(3);

    await completed.getByTitle('Archive all completed items').click();
    await dialog(page).getByRole('button', { name: 'Archive All' }).click();

    await expect(completed.getByText('No items')).toBeVisible();
    await expect(completed.getByTitle('Archive all completed items')).toBeHidden();

    const archivedDocs = await page.request.get(
      `${project.baseURL}/api/tasks/${TASKS.authDocs.id}`
    );
    expect((await archivedDocs.json()) as { status: string }).toMatchObject({ status: 'archived' });
  });

  test('creates a task preset to the column status from the column add button', async ({
    page,
  }) => {
    await kanbanColumn(page, 'In Progress').getByTitle('Add task to In Progress').click();

    const sheet = dialog(page);
    await expect(sheet.getByRole('heading', { name: 'Create New Task' })).toBeVisible();
    await expect(sheet.getByRole('combobox', { name: 'Status' })).toHaveText('In Progress');

    await sheet.getByPlaceholder('Task title').fill('Column scoped task');
    await sheet.getByRole('button', { name: 'Create' }).click();

    await expect(toast(page, `Task ${NEXT_TASK_ID} created`)).toBeVisible();
    await expect(taskCard(kanbanColumn(page, 'In Progress'), NEXT_TASK_ID)).toBeVisible();
  });

  test('opens detail modals from cards', async ({ page }) => {
    await taskCard(page, TASKS.revenueChart.id).click();
    await expect(
      dialog(page).getByRole('heading', { name: TASKS.revenueChart.title })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();

    await epicCard(page, EPICS.reporting.id).click();
    await expect(dialog(page).getByRole('heading', { name: EPICS.reporting.title })).toBeVisible();
  });
});
