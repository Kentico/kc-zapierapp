interface ObjectConstructor {
  keys<TKey extends string, TValue>(o: Readonly<Record<TKey, TValue>>): TKey[];
}
