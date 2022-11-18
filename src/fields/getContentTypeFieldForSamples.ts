import { Field } from './field';

export const getContentTypeFieldForSamples = (extras?: Partial<Field>): Field => ({
  label: 'Content type for samples',
  key: 'contentTypeId',
  type: 'string',
  helpText: 'If you select a content type, the samples from this trigger will be of that type. If empty, the first found items will be provided.',
  dynamic: 'get_content_types.id.name',
  ...extras,
});
