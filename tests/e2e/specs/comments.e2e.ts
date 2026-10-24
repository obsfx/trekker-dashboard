import { expect, test } from '../support/fixtures';
import { COMMENTS, TASKS } from '../support/seed';
import { openTaskFromKanban, toast } from '../support/ui';

test.describe('task comments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('lists seeded comments', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.loginForm);

    await expect(modal.getByRole('heading', { name: 'Comments (2)' })).toBeVisible();
    for (const comment of Object.values(COMMENTS)) {
      await expect(modal.getByText(comment.content)).toBeVisible();
      await expect(modal.getByText(comment.author, { exact: true })).toBeVisible();
    }
  });

  test('adds a comment and remembers the author', async ({ page }) => {
    const modal = await openTaskFromKanban(page, TASKS.loginForm);
    const addButton = modal.getByRole('button', { name: 'Add Comment' });
    await expect(addButton).toBeDisabled();

    await modal.getByPlaceholder('Your name').fill('carol');
    await expect(addButton).toBeDisabled();
    await modal.getByPlaceholder('Add a comment...').fill('Needs a11y review.\nSecond line.');
    await addButton.click();

    await expect(toast(page, 'Comment added')).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Comments (3)' })).toBeVisible();
    await expect(modal.getByText(/Needs a11y review\.\s+Second line\./)).toBeVisible();
    await expect(modal.getByPlaceholder('Add a comment...')).toHaveValue('');

    await page.keyboard.press('Escape');
    await openTaskFromKanban(page, TASKS.jwtRefresh);
    await expect(page.getByPlaceholder('Your name')).toHaveValue('carol');
    await expect(page.getByRole('heading', { name: 'Comments', exact: true })).toBeVisible();
  });

  test('deletes a comment', async ({ page, project }) => {
    const modal = await openTaskFromKanban(page, TASKS.loginForm);
    const commentBody = modal.getByText(COMMENTS.layout.content);

    await commentBody.locator('..').getByRole('button', { name: 'Delete comment' }).click();

    await expect(toast(page, 'Comment deleted')).toBeVisible();
    await expect(commentBody).toHaveCount(0);
    await expect(modal.getByRole('heading', { name: 'Comments (1)' })).toBeVisible();

    const response = await page.request.get(
      `${project.baseURL}/api/tasks/${TASKS.loginForm.id}/comments`
    );
    expect(await response.json()).toHaveLength(1);
  });
});
