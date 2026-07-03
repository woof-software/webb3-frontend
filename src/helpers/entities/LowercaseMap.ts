/**
 * A specialized map (Map) that by default converts its keys to lowercase when calling set, get, and other methods. Useful while handling dictionaries whose keys are Ethereum addresses. Usage of it avoids the requirement of register conversion on the calling level.
 *
 * @example
 * const source = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
 * const target = '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf';
 *
 * const balances = new LowercaseMap();
 *
 * map.set(source, 100);
 *
 * const targetBalance = balances.get(target);
 *
 * // targetBalance is 100
 */
export class LowercaseMap<V> extends Map<string, V> {
  constructor(...args: ConstructorParameters<typeof Map<string, V>>) {
    super(...args);
  }

  public get(key: string): V | undefined {
    return super.get(key.toLowerCase());
  }

  public set(key: string, value: V): this {
    return super.set(key.toLowerCase(), value);
  }

  public has(key: string): boolean {
    return super.has(key.toLowerCase());
  }
}
