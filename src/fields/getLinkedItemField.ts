import { Field } from './field';

export const getLinkedItemField = (extras: Partial<Omit<Field, 'key' | 'label'>> & Pick<Field, 'key' | 'label'>): Field => ({
  search: 'find_item.id',
  list: true,
  dynamic: 'get_linked_items.id.name',
  type: 'string',
  altersDynamicFields: false,
  ...extras,
});
