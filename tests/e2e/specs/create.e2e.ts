import { expect, test } from '../support/fixtures';
import { EPICS, NEXT_EPIC_ID, NEXT_TASK_ID, TASKS } from '../support/seed';
import { chooseOption, dialog, epicCard, kanbanColumn, taskCard, toast } from '../support/ui';

test.describe('create sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(taskCard(page, TASKS.loginForm.id)).toBeVisible();
    await page.getByRole('button', { name: 'New', exact: true }).click();
    await expect(dialog(page).getByRole('heading', { name: 'Create New Task' })).toBeVisible();
  });

  test('creates a task with every field', async ({ page }) => {
    const sheet = dialog(page);
    await sheet.getByPlaceholder('Task title').fill('Ship SSO login');
    await sheet.getByPlaceholder('Optional description').fill('Support SAML providers');
    await chooseOption(page, sheet.getByRole('combobox', { name: 'Status' }), 'In Progress');
    await chooseOption(page, sheet.getByRole('combobox', { name: 'Priority' }), 'P0 - Critical');
    await sheet.getByPlaceholder('bug, frontend, urgent').fill('sso, security');

    await sheet.getByRole('combobox', { name: 'Epic' }).click();
    await sheet.getByPlaceholder('Search...').fill('auth');
    await expect(sheet.getByRole('button', { name: EPICS.reporting.title })).toHaveCount(0);
    await sheet.getByRole('button', { name: new RegExp(EPICS.auth.title) }).click();
    await expect(sheet.getByRole('combobox', { name: 'Epic' })).toContainText(EPICS.auth.title);

    await sheet.getByRole('button', { name: 'Create' }).click();

    await expect(toast(page, `Task ${NEXT_TASK_ID} created`)).toBeVisible();
    await expect(sheet).toBeHidden();
    const card = taskCard(kanbanColumn(page, 'In Progress'), NEXT_TASK_ID);
    await expect(card.getByRole('heading', { name: 'Ship SSO login' })).toBeVisible();
    await expect(card.getByText('Support SAML providers')).toBeVisible();
    await expect(card.getByText('P0', { exact: true })).toBeVisible();
    await expect(card.getByText(EPICS.auth.title)).toBeVisible();
    await expect(card.getByText('sso', { exact: true })).toBeVisible();
    await expect(card.getByText('security', { exact: true })).toBeVisible();
    await expect(epicCard(page, EPICS.auth.id).getByText('1/4 tasks')).toBeVisible();
  });

  test('clears a selected epic before creating', async ({ page }) => {
    const sheet = dialog(page);
    await sheet.getByPlaceholder('Task title').fill('Unassigned task');
    const epicSelect = sheet.getByRole('combobox', { name: 'Epic' });
    await epicSelect.click();
    await sheet.getByRole('button', { name: new RegExp(EPICS.reporting.title) }).click();
    await expect(epicSelect).toContainText(EPICS.reporting.title);

    await epicSelect.click();
    await sheet.getByRole('button', { name: new RegExp(EPICS.reporting.title) }).click();
    await expect(epicSelect).toHaveText('No Epic');

    await sheet.getByRole('button', { name: 'Create' }).click();
    await expect(toast(page, `Task ${NEXT_TASK_ID} created`)).toBeVisible();
    await expect(taskCard(page, NEXT_TASK_ID).getByText(EPICS.reporting.title)).toHaveCount(0);
  });

  test('creates an epic', async ({ page }) => {
    const sheet = dialog(page);
    await chooseOption(page, sheet.getByRole('combobox', { name: 'Type' }), 'Epic');
    await expect(sheet.getByRole('heading', { name: 'Create New Epic' })).toBeVisible();
    await expect(sheet.getByPlaceholder('bug, frontend, urgent')).toHaveCount(0);

    await sheet.getByPlaceholder('Epic title').fill('Mobile app');
    await chooseOption(page, sheet.getByRole('combobox', { name: 'Priority' }), 'P1 - High');
    await sheet.getByRole('button', { name: 'Create' }).click();

    await expect(toast(page, `Epic ${NEXT_EPIC_ID} created`)).toBeVisible();
    const card = epicCard(kanbanColumn(page, 'TODO'), NEXT_EPIC_ID);
    await expect(card.getByRole('heading', { name: 'Mobile app' })).toBeVisible();
    await expect(card.getByText('P1', { exact: true })).toBeVisible();
  });

  test('creates a subtask under a parent task', async ({ page }) => {
    const sheet = dialog(page);
    await chooseOption(page, sheet.getByRole('combobox', { name: 'Type' }), 'Subtask');
    await expect(sheet.getByRole('heading', { name: 'Create New Subtask' })).toBeVisible();

    await sheet.getByPlaceholder('Subtask title').fill('Pick chart library');
    await sheet.getByRole('combobox', { name: 'Parent task' }).click();
    await sheet.getByPlaceholder('Search...').fill(TASKS.revenueChart.id);
    await sheet.getByRole('button', { name: new RegExp(TASKS.revenueChart.title) }).click();
    await sheet.getByRole('button', { name: 'Create' }).click();

    await expect(toast(page, `Subtask ${NEXT_TASK_ID} created`)).toBeVisible();
    await expect(taskCard(page, NEXT_TASK_ID)).toHaveCount(0);
    await expect(
      taskCard(page, TASKS.revenueChart.id).getByText('0/1', { exact: true })
    ).toBeVisible();
  });

  test('requires a parent task for subtasks', async ({ page }) => {
    const sheet = dialog(page);
    await chooseOption(page, sheet.getByRole('combobox', { name: 'Type' }), 'Subtask');
    await sheet.getByPlaceholder('Subtask title').fill('Orphan subtask');
    await sheet.getByRole('button', { name: 'Create' }).click();

    await expect(sheet.getByText('Parent task is required')).toBeVisible();
    await expect(sheet).toBeVisible();
  });

  test('requires a title', async ({ page }) => {
    const sheet = dialog(page);
    await sheet.getByRole('button', { name: 'Create' }).click();

    await expect(sheet.getByText('Title is required')).toBeVisible();
    await expect(toast(page, 'Title is required')).toBeVisible();
    await expect(sheet).toBeVisible();
  });

  test('cancel discards the draft', async ({ page, project }) => {
    const sheet = dialog(page);
    await sheet.getByPlaceholder('Task title').fill('Never saved');
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expect(sheet).toBeHidden();

    const response = await page.request.get(`${project.baseURL}/api/tasks/${NEXT_TASK_ID}`);
    expect(response.status()).toBe(404);
    await expect(page.getByText('Never saved')).toHaveCount(0);
  });
});
