const store = new Map<string, any>();

export function get(key: string): any {
  return store.get(key);
}

export function set(key: string, value: any): any {
  store.set(key, value);
}