import { expect, type Locator, type Page } from '@playwright/test';

export function kanbanColumn(page: Page, label: string): Locator {
  return page.getByRole('region', { name: label, exact: true });
}

export function taskCard(scope: Page | Locator, taskId: string): Locator {
  return scope.locator(`[data-task-id="${taskId}"]`);
}

export function epicCard(scope: Page | Locator, epicId: string): Locator {
  return scope.locator(`[data-epic-id="${epicId}"]`);
}

export async function columnItemIds(column: Locator): Promise<string[]> {
  return column.getByText(/^(EPIC|TREK)-\d+$/).allTextContents();
}

export async function chooseOption(page: Page, trigger: Locator, optionName: string) {
  await trigger.click();
  await page.getByRole('option', { name: optionName, exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
}

export function dialog(page: Page): Locator {
  return page.getByRole('dialog');
}

export function toast(page: Page, text: string | RegExp): Locator {
  return page.locator('[data-sonner-toast]').filter({ hasText: text });
}

interface TaskRef {
  id: string;
  title: string;
}

export async function openTaskFromKanban(page: Page, task: TaskRef) {
  await taskCard(page, task.id).click();
  await expect(dialog(page).getByRole('heading', { name: task.title })).toBeVisible();
  return dialog(page);
}

export async function openTaskEditor(page: Page, task: TaskRef) {
  const modal = await openTaskFromKanban(page, task);
  await modal.getByRole('button', { name: 'Edit' }).click();
  return modal;
}
