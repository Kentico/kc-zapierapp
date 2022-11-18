import { Field } from './field';

export const getLanguageField = (extras?: Partial<Field>): Field => ({
  label: 'Language',
  key: 'languageId',
  type: 'string',
  dynamic: 'get_languages.id.name',
  ...extras,
});
