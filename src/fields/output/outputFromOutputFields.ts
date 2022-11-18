import { OutputField } from './outputField';

export type OutputFromOutputFields<Fields extends ReadonlyArray<OutputField>, Acc = {}> =
  Fields extends readonly []
    ? Acc
    : Fields extends readonly [infer Field extends OutputField, ...infer RestFields extends ReadonlyArray<OutputField>]
      ? OutputFromOutputFields<RestFields, Acc & CreateObjectFromField<Field>>
      : never;

type CreateObjectFromField<Field extends OutputField> =
  Field['key'] extends `${infer ObjectParentKey}__${infer ObjectChildKey}`
    ? ObjectParentKey extends `${infer ArrayParentKey}[]${infer ArrayChildPart}`
      ? { readonly [key in ArrayParentKey]: ReadonlyArray<CreateObjectFromField<Omit<Field, 'key'> & { key: `${ArrayChildPart}__${ObjectChildKey}` }>> }
      : { readonly [key in ObjectParentKey]: CreateObjectFromField<Omit<Field, 'key'> & { key: ObjectChildKey }> }
    : Field['key'] extends `${infer ArrayParentKey}[]${infer ArrayChildKey}`
      ? { readonly [key in ArrayParentKey]: ReadonlyArray<CreateObjectFromField<Omit<Field, 'key'> & { key: ArrayChildKey }>> }
      : { readonly [key in Field['key']]: FieldType<Field> }


type FieldTypeToTSType = {
  string: string;
  datetime: string;
  number: number;
  boolean: boolean;
};

type FieldType<Field extends OutputField, Lookup extends Record<OutputField['type'], unknown> = FieldTypeToTSType> =
  MakeListIfNeeded<Field, MakeOptionalIfNeeded<Field, FieldTypeToTSType[Field['type']]>>;

type MakeOptionalIfNeeded<Field extends OutputField, Type> =
  Field['required'] extends true ? Type : Type | undefined;

type MakeListIfNeeded<Field extends OutputField, Type> =
  Field['list'] extends true ? ReadonlyArray<Type> : Type;
