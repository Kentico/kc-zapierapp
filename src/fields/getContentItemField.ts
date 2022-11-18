import { Field } from './field';

export const getContentItemField = (extras?: Partial<Field>): Field => ({
  search: 'find_item.fullId',
  list: false,
  required: false,
  dynamic: 'get_content_items.fullId.name',
  label: 'Content item',
  key: 'fullItemId',
  type: 'string',
  altersDynamicFields: false,
  ...extras,
});
