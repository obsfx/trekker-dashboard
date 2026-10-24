import { expect, test } from '../support/fixtures';
import { EPICS, NEXT_EPIC_ID, NEXT_TASK_ID, TASKS } from '../support/seed';
import { epicCard, kanbanColumn, taskCard, toast } from '../support/ui';

test.describe('live updates from external trekker changes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Connected to live updates')).toBeVisible();
    await expect(taskCard(page, TASKS.loginForm.id)).toBeVisible();
  });

  test('shows tasks created, updated and deleted by the CLI', async ({ page, project }) => {
    project.trekker(['task', 'create', '-t', 'Created by an agent']);
    await expect(toast(page, `Task ${NEXT_TASK_ID} created`)).toBeVisible();
    await expect(taskCard(kanbanColumn(page, 'TODO'), NEXT_TASK_ID)).toBeVisible();

    project.trekker(['task', 'update', NEXT_TASK_ID, '-s', 'in_progress']);
    await expect(toast(page, `Task ${NEXT_TASK_ID} updated`)).toBeVisible();
    await expect(taskCard(kanbanColumn(page, 'In Progress'), NEXT_TASK_ID)).toBeVisible();

    project.trekker(['task', 'delete', NEXT_TASK_ID]);
    await expect(toast(page, `Task ${NEXT_TASK_ID} deleted`)).toBeVisible();
    await expect(taskCard(page, NEXT_TASK_ID)).toHaveCount(0);
  });

  test('shows epics created and updated by the CLI', async ({ page, project }) => {
    project.trekker(['epic', 'create', '-t', 'Agent epic']);
    await expect(toast(page, `Epic ${NEXT_EPIC_ID} created`)).toBeVisible();
    await expect(epicCard(kanbanColumn(page, 'TODO'), NEXT_EPIC_ID)).toBeVisible();

    project.trekker(['epic', 'update', EPICS.reporting.id, '-s', 'completed']);
    await expect(toast(page, `Epic ${EPICS.reporting.id} updated`)).toBeVisible();
    await expect(epicCard(kanbanColumn(page, 'Completed'), EPICS.reporting.id)).toBeVisible();
  });
});
