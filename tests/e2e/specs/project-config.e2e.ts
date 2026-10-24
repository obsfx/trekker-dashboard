import { expect, test } from '../support/fixtures';
import { PROJECT_NAME, TASKS } from '../support/seed';
import { dialog, openTaskFromKanban, taskCard, toast } from '../support/ui';

test.describe('project prefixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(taskCard(page, TASKS.loginForm.id)).toBeVisible();
    await page.getByRole('button', { name: 'Prefixes' }).click();
    await expect(dialog(page).getByRole('heading', { name: 'ID Prefixes' })).toBeVisible();
  });

  test('shows the current prefixes', async ({ page }) => {
    const modal = dialog(page);
    await expect(modal.getByText(`${PROJECT_NAME}:`)).toBeVisible();
    await expect(modal.getByLabel('Issue prefix')).toHaveValue('TREK');
    await expect(modal.getByLabel('Epic prefix')).toHaveValue('EPIC');
    await expect(modal.getByLabel('Comment prefix')).toHaveValue('CMT');
  });

  test('applies new prefixes to newly created entities', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByLabel('Issue prefix').fill('BUG');
    await modal.getByLabel('Epic prefix').fill('INIT');
    await modal.getByLabel('Comment prefix').fill('NOTE');
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(toast(page, 'Project prefixes updated')).toBeVisible();
    await expect(modal).toBeHidden();

    await page.getByRole('button', { name: 'New', exact: true }).click();
    await dialog(page).getByPlaceholder('Task title').fill('Prefixed task');
    await dialog(page).getByRole('button', { name: 'Create' }).click();
    await expect(toast(page, /^Task BUG-\d+ created$/)).toBeVisible();
    await expect(page.getByText(/^BUG-\d+$/)).toBeVisible();

    const taskModal = await openTaskFromKanban(page, TASKS.loginForm);
    await taskModal.getByPlaceholder('Your name').fill('dana');
    await taskModal.getByPlaceholder('Add a comment...').fill('Prefixed comment');
    await taskModal.getByRole('button', { name: 'Add Comment' }).click();
    await expect(toast(page, 'Comment added')).toBeVisible();

    const comments = (await (
      await page.request.get(`/api/tasks/${TASKS.loginForm.id}/comments`)
    ).json()) as { id: string; content: string }[];
    expect(comments.find((comment) => comment.content === 'Prefixed comment')?.id).toMatch(
      /^NOTE-\d+$/
    );
  });

  test('rejects duplicate prefixes', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByLabel('Epic prefix').fill('TREK');
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(toast(page, /Prefix values must be unique/)).toBeVisible();
    await expect(modal).toBeVisible();
  });

  test('cancel discards changes', async ({ page }) => {
    const modal = dialog(page);
    await modal.getByLabel('Issue prefix').fill('TMP');
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();

    await page.getByRole('button', { name: 'Prefixes' }).click();
    await expect(dialog(page).getByLabel('Issue prefix')).toHaveValue('TREK');
  });
});
