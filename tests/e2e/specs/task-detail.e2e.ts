import { expect, test } from '../support/fixtures';
import { EPICS, SUBTASKS, TASKS } from '../support/seed';
import {
  chooseOption,
  dialog,
  epicCard,
  kanbanColumn,
  openTaskEditor,
  openTaskFromKanban,
  taskCard,
  toast,
} from '../support/ui';

test.describe('task detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows task details, markdown description and relations', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.loginForm);

    await expect(modal.getByRole('navigation').getByText(EPICS.auth.id)).toBeVisible();
    await expect(modal.getByRole('navigation').getByText(TASKS.loginForm.id)).toBeVisible();
    await expect(modal.locator('strong', { hasText: 'email' })).toBeVisible();
    await expect(modal.getByRole('listitem').filter({ hasText: 'remember me' })).toBeVisible();

    await expect(modal.getByRole('combobox', { name: 'Status' })).toHaveText('In Progress');
    await expect(modal.getByRole('combobox', { name: 'Priority' })).toHaveText('P1 - High');
    await expect(modal.getByRole('button', { name: EPICS.auth.id })).toBeVisible();
    await expect(modal.getByText('frontend', { exact: true })).toBeVisible();
    await expect(modal.getByText('auth', { exact: true })).toBeVisible();

    await expect(modal.getByText('Blocks', { exact: true })).toBeVisible();
    await expect(modal.getByTitle('Blocks this task')).toHaveText(TASKS.jwtRefresh.id);
    await expect(modal.getByRole('heading', { name: 'Subtasks (1/2)' })).toBeVisible();
    await expect(
      modal.getByRole('button', { name: new RegExp(SUBTASKS.emailValidation.title) })
    ).toBeVisible();
    await expect(
      modal.getByRole('button', { name: new RegExp(SUBTASKS.passwordMeter.title) })
    ).toBeVisible();
  });

  test('shows placeholder for a task without description', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.revenueChart);
    await expect(modal.getByText('No description')).toBeVisible();
  });

  test('changes status and priority inline', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.revenueChart);

    await chooseOption(page, modal.getByRole('combobox', { name: 'Status' }), 'Completed');
    await expect(modal.getByRole('combobox', { name: 'Status' })).toHaveText('Completed');
    await chooseOption(page, modal.getByRole('combobox', { name: 'Priority' }), 'P0 - Critical');
    await expect(modal.getByRole('combobox', { name: 'Priority' })).toHaveText('P0 - Critical');

    await page.keyboard.press('Escape');
    const card = taskCard(kanbanColumn(page, 'Completed'), TASKS.revenueChart.id);
    await expect(card).toBeVisible();
    await expect(card.getByText('P0', { exact: true })).toBeVisible();
  });

  test('navigates through dependencies, subtasks, breadcrumbs and epic link', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.loginForm);

    await modal.getByTitle('Blocks this task').click();
    await expect(modal.getByRole('heading', { name: TASKS.jwtRefresh.title })).toBeVisible();
    await modal.getByTitle('Depends on this task').click();
    await expect(modal.getByRole('heading', { name: TASKS.loginForm.title })).toBeVisible();

    await modal.getByRole('button', { name: new RegExp(SUBTASKS.passwordMeter.title) }).click();
    await expect(modal.getByRole('heading', { name: SUBTASKS.passwordMeter.title })).toBeVisible();
    await modal.getByRole('navigation').getByText(TASKS.loginForm.id).click();
    await expect(modal.getByRole('heading', { name: TASKS.loginForm.title })).toBeVisible();

    await modal.getByRole('button', { name: EPICS.auth.id }).click();
    await expect(modal.getByRole('heading', { name: EPICS.auth.title })).toBeVisible();
  });

  test('edits and saves every field', async ({ page }) => {
    const modal = await openTaskEditor(page, TASKS.jwtRefresh);

    await modal.getByPlaceholder('Task title').fill('Add refresh token rotation');
    await modal.getByPlaceholder('Task description').fill('Rotate on **every** request');
    await chooseOption(page, modal.getByRole('combobox', { name: 'Status' }), 'In Progress');
    await chooseOption(page, modal.getByRole('combobox', { name: 'Priority' }), 'P3 - Low');
    await modal.getByPlaceholder('bug, frontend, urgent').fill('backend, security');
    await chooseOption(
      page,
      modal.getByRole('combobox', { name: 'Epic' }),
      `${EPICS.reporting.id}: ${EPICS.reporting.title}`
    );
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(toast(page, 'Task updated')).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Add refresh token rotation' })).toBeVisible();
    await expect(modal.locator('strong', { hasText: 'every' })).toBeVisible();
    await expect(modal.getByRole('combobox', { name: 'Status' })).toHaveText('In Progress');
    await expect(modal.getByRole('combobox', { name: 'Priority' })).toHaveText('P3 - Low');
    await expect(modal.getByRole('button', { name: EPICS.reporting.id })).toBeVisible();
    await expect(modal.getByText('security', { exact: true })).toBeVisible();

    await page.keyboard.press('Escape');
    const card = taskCard(kanbanColumn(page, 'In Progress'), TASKS.jwtRefresh.id);
    await expect(card.getByText(EPICS.reporting.title)).toBeVisible();
    await expect(epicCard(page, EPICS.reporting.id).getByText('0/2 tasks')).toBeVisible();
  });

  test('removes the epic from a task', async ({ page }) => {
    const modal = await openTaskEditor(page, TASKS.jwtRefresh);
    await chooseOption(page, modal.getByRole('combobox', { name: 'Epic' }), 'No Epic');
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(toast(page, 'Task updated')).toBeVisible();
    await expect(modal.getByRole('button', { name: EPICS.auth.id })).toHaveCount(0);
    await expect(epicCard(page, EPICS.auth.id).getByText('1/2 tasks')).toBeAttached();
  });

  test('rejects saving an empty title', async ({ page }) => {
    const modal = await openTaskEditor(page, TASKS.jwtRefresh);
    await modal.getByPlaceholder('Task title').fill('');
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(modal.getByText('Title is required')).toBeVisible();
    await expect(modal.getByPlaceholder('Task title')).toBeVisible();
  });

  test('cancel discards edits', async ({ page }) => {
    const modal = await openTaskEditor(page, TASKS.jwtRefresh);
    await modal.getByPlaceholder('Task title').fill('Discarded title');
    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(modal.getByRole('heading', { name: TASKS.jwtRefresh.title })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(taskCard(page, TASKS.jwtRefresh.id).getByRole('heading')).toHaveText(
      TASKS.jwtRefresh.title
    );
  });

  test('deletes a task after confirmation', async ({ page }) => {
    const modal = await openTaskEditor(page, TASKS.revenueChart);

    await modal.getByRole('button', { name: 'Delete Task' }).click();
    await expect(modal.getByText('Delete?')).toBeVisible();
    await modal.getByRole('button', { name: 'No' }).click();
    await expect(modal.getByRole('button', { name: 'Delete Task' })).toBeVisible();

    await modal.getByRole('button', { name: 'Delete Task' }).click();
    await modal.getByRole('button', { name: 'Yes' }).click();

    await expect(toast(page, 'Task deleted')).toBeVisible();
    await expect(dialog(page)).toBeHidden();
    await expect(taskCard(page, TASKS.revenueChart.id)).toHaveCount(0);
  });

  test('history tab lists the task timeline', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.revenueChart);
    await chooseOption(page, modal.getByRole('combobox', { name: 'Priority' }), 'P1 - High');

    await modal.getByRole('button', { name: 'History' }).click();
    await expect(modal.getByRole('heading', { name: 'History (2)' })).toBeVisible();
    await expect(modal.getByText('created', { exact: true })).toBeVisible();
    await expect(modal.getByText('updated', { exact: true })).toBeVisible();
    await expect(modal.getByText('priority:')).toBeVisible();

    await modal.getByRole('button', { name: 'Comments' }).click();
    await expect(modal.getByRole('heading', { name: 'Comments', exact: true })).toBeVisible();
  });
});
