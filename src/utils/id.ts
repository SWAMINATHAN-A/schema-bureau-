let counter = 0;

export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function slug(value: string): string {
  return value.
  toLowerCase().
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-|-$/g, '');
}