export type Field = Readonly<{
  key: string;
  type: 'string' | 'number' | 'datetime' | 'copy' | 'text' | 'unicode' | 'float';
  label: string;
  dynamic?: string;
  list?: boolean;
  required?: boolean;
  helpText?: string;
  altersDynamicFields?: boolean;
  choices?: ReadonlyArray<Readonly<{ value: string; sample: string; label: string }>>
  default?: string;
  search?: string;
}>;
