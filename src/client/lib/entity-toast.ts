type EntityKind = 'task' | 'epic';
type EntityChange = 'created' | 'updated' | 'deleted';

export function entityToastId(kind: EntityKind, change: EntityChange, id: string): string {
  return `${kind}_${change}:${id}`;
}
