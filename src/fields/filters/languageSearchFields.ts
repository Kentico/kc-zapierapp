//const getOperatorChoices = require('./getOperatorChoices');

import { Field } from '../field';

const searchInfo: Field = {
  label: 'Search info',
  key: 'searchInfo',
  helpText: `### Search by value
        
    You can search for the language based on several values.`,
  type: 'copy',
};

const searchFieldChoices = [
  { value: 'id', sample: 'id', label: 'Language ID' },
  { value: 'externalId', sample: 'externalId', label: 'External ID' },
  { value: 'codename', sample: `codename`, label: 'Code name' },
];

const searchField: Field = {
  label: 'Search field',
  key: 'searchField',
  type: 'string',
  helpText: 'Select the field based on which the language should be found.',
  required: true,
  choices: searchFieldChoices,
  altersDynamicFields: false,
};

const searchOperatorChoices = [
  { value: '{0}={1}', sample: '{0}={1}', label: 'Equals' },
]; //await getOperatorChoices(z, bundle, contentTypeId, searchField); - TODO allow other operators

const searchOperatorField: Field = {
  label: 'Search operator',
  key: 'searchPattern',
  type: 'string',
  helpText: 'Select how the search value should be matched.',
  required: true,
  choices: searchOperatorChoices,
  default: searchOperatorChoices[0]?.value ?? '',
  altersDynamicFields: false,
};

const searchValueField: Field = {
  label: 'Search value',
  key: 'searchValue',
  helpText: 'Value to match in the search field. The value must match exactly.',
  type: 'string',
  required: true,
  altersDynamicFields: false,
};

export const languageSearchFields = [searchInfo, searchField, searchOperatorField, searchValueField];

export type LanguageSearchFieldsOutput = Readonly<{
  searchField: string;
  searchPattern: string;
  searchValue: string;
}>;
