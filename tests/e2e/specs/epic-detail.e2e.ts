import { expect, test } from '../support/fixtures';
import { EPICS, TASKS } from '../support/seed';
import { chooseOption, dialog, epicCard, kanbanColumn, taskCard, toast } from '../support/ui';

test.describe('epic detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await epicCard(page, EPICS.auth.id).click();
    await expect(dialog(page).getByRole('heading', { name: EPICS.auth.title })).toBeVisible();
  });

  test('shows epic details and its tasks', async ({ page }) => {
    const modal = dialog(page);

    await expect(modal.getByRole('navigation').getByText(EPICS.auth.id)).toBeVisible();
    await expect(modal.locator('strong', { hasText: 'session' })).toBeVisible();
    await expect(modal.getByRole('listitem').filter({ hasText: 'OAuth providers' })).toBeVisible();
    await expect(modal.getByRole('combobox', { name: 'Status' })).toHaveText('In Progress');
    await expect(modal.getByRole('combobox', { name: 'Priority' })).toHaveText('P1 - High');
    await expect(modal.getByRole('heading', { name: 'Tasks (1/3)' })).toBeVisible();
    for (const task of [TASKS.loginForm, TASKS.jwtRefresh, TASKS.authDocs]) {
      await expect(modal.getByRole('button', { name: new RegExp(task.title) })).toBeVisible();
    }
  });

  test('opens a task from the epic task list', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByRole('button', { name: new RegExp(TASKS.jwtRefresh.title) }).click();

    await expect(modal.getByRole('heading', { name: TASKS.jwtRefresh.title })).toBeVisible();
    await expect(modal.getByRole('button', { name: EPICS.auth.id })).toBeVisible();
  });

  test('changes status and priority inline', async ({ page }) => {
    const modal = dialog(page);
    await chooseOption(page, modal.getByRole('combobox', { name: 'Status' }), 'Completed');
    await chooseOption(page, modal.getByRole('combobox', { name: 'Priority' }), 'P4 - Backlog');
    await expect(modal.getByRole('combobox', { name: 'Status' })).toHaveText('Completed');

    await page.keyboard.press('Escape');
    const card = epicCard(kanbanColumn(page, 'Completed'), EPICS.auth.id);
    await expect(card).toBeVisible();
    await expect(card.getByText('P4', { exact: true })).toBeVisible();
  });

  test('edits and saves the epic', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByRole('button', { name: 'Edit' }).click();

    await modal.getByPlaceholder('Epic title').fill('Identity platform');
    await modal.getByPlaceholder('Epic description').fill('Unified identity');
    await chooseOption(page, modal.getByRole('combobox', { name: 'Status' }), 'TODO');
    await chooseOption(page, modal.getByRole('combobox', { name: 'Priority' }), 'P0 - Critical');
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(toast(page, 'Epic updated')).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Identity platform' })).toBeVisible();
    await expect(modal.getByText('Unified identity')).toBeVisible();

    await page.keyboard.press('Escape');
    const card = epicCard(kanbanColumn(page, 'TODO'), EPICS.auth.id);
    await expect(card.getByRole('heading', { name: 'Identity platform' })).toBeVisible();
    await expect(taskCard(page, TASKS.loginForm.id).getByText('Identity platform')).toBeVisible();
  });

  test('cancel discards edits', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByRole('button', { name: 'Edit' }).click();
    await modal.getByPlaceholder('Epic title').fill('Discarded epic title');
    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(modal.getByRole('heading', { name: EPICS.auth.title })).toBeVisible();
  });

  test('deletes the epic after confirmation', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByRole('button', { name: 'Edit' }).click();
    await modal.getByRole('button', { name: 'Delete Epic' }).click();
    await modal.getByRole('button', { name: 'Yes' }).click();

    await expect(toast(page, 'Epic deleted')).toBeVisible();
    await expect(dialog(page)).toBeHidden();
    await expect(epicCard(page, EPICS.auth.id)).toHaveCount(0);
    await expect(taskCard(page, TASKS.loginForm.id).getByText(EPICS.auth.title)).toHaveCount(0);
  });
});
