import { Field } from './field';

export const getContentTypeField = (extras?: Partial<Field>): Field => ({
  label: 'Content type',
  key: 'contentTypeId',
  type: 'string',
  helpText: 'Note: dynamic values from other steps cannot be used here',
  dynamic: 'get_content_types.id.name',
  ...extras,
});
