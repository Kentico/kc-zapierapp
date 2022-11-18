export type OutputField = Readonly<{
  key: string;
  label: string;
  type: 'string' | 'datetime' | 'number' | 'boolean';
  required?: boolean;
  list?: boolean;
}>;
