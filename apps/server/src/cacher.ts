const store = new Map<string, any>();

export async function get(key: string): Promise<any> {
  return store.get(key);
}

export async function set(key: string, value: any): Promise<void> {
  store.set(key, value);
}