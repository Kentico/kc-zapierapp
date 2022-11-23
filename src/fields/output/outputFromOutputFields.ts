import { OutputField } from './outputField';

/**
 * Iterates over the fields and creates a type of expected output object build up from the fields.
 * The resulting object is build as an intersection of smaller objects for each field.
 *
 * - Leverages TCO for better performance
 *
 * @example
 *    const outputFields = [
 *      {
 *        key: 'a',
 *        label: 'my label',
 *        type: 'string',
 *      },
 *      // ...more fields
 *    ] as const satisfies ReadonlyArray<OutputField>; // as const ensures the most specific type is inferred and satisfies ensures the specific inferred type is still a valid array of output fields
 *
 *    type Output = OutputFromOutputFields<typeof outputFields>;
 *
 * @example
 *  OutputFromOutputFields<[{ key: 'a__b'; label: ''; type: 'string' }, { key: 'a__c'; label: ''; type: 'number' }]> =>
 *    { a: { b: string } } & { a: { c: number } } === { a: { b: string; c: number } }
 */
export type OutputFromOutputFields<Fields extends ReadonlyArray<OutputField>, Acc = {}> =
  Fields extends readonly []
    ? Acc
    : Fields extends readonly [infer Field extends OutputField, ...infer RestFields extends ReadonlyArray<OutputField>]
      ? OutputFromOutputFields<RestFields, Acc & CreateObjectFromField<Field>>
      : never;

/**
 * Create an object from a single {@link OutputField}. The result will be used in an intersection of all fields to build up the resulting object type.
 */
type CreateObjectFromField<Field extends OutputField> =
  Field['key'] extends `${infer ObjectParentKey}__${infer ObjectChildKey}`
    ? ObjectParentKey extends `${infer ArrayParentKey}[]${infer ArrayChildPart}`
      ? { readonly [key in ArrayParentKey]: ReadonlyArray<CreateObjectFromField<Omit<Field, 'key'> & { key: `${ArrayChildPart}__${ObjectChildKey}` }>> }
      : { readonly [key in ObjectParentKey]: CreateObjectFromField<Omit<Field, 'key'> & { key: ObjectChildKey }> }
    : Field['key'] extends `${infer ArrayParentKey}[]${infer ArrayChildKey}`
      ? { readonly [key in ArrayParentKey]: ReadonlyArray<CreateObjectFromField<Omit<Field, 'key'> & { key: ArrayChildKey }>> }
      : { readonly [key in Field['key']]: FieldType<Field> }


/**
 * Map from possible values of property 'type' on {@link OutputField} to their representation in TS.
 */
type FieldTypeToTSType = {
  string: string;
  datetime: string;
  number: number;
  boolean: boolean;
};

/**
 * Creates a TS type for an {@link OutputField} property based on its 'type', 'required' and 'list' properties.
 *
 * - The Lookup parameter is not supposed to be used outside (always the default value should be used).
 *    It is meant to check (using its restriction) that the {@link FieldTypeToTSType} contains a binding for every possible value of property 'type' of the {@link OutputField} type.
 */
type FieldType<Field extends OutputField, Lookup extends Record<OutputField['type'], unknown> = FieldTypeToTSType> =
  MakeListIfNeeded<Field, MakeOptionalIfNeeded<Field, FieldTypeToTSType[Field['type']]>>;

type MakeOptionalIfNeeded<Field extends OutputField, Type> =
  Field['required'] extends true ? Type : Type | undefined;

type MakeListIfNeeded<Field extends OutputField, Type> =
  Field['list'] extends true ? ReadonlyArray<Type> : Type;
