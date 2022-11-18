import { Field } from '../field';

export const searchInfo: Field = {
  label: 'Search info',
  key: 'searchInfo',
  helpText: `### Search by value
        
    You can search for the asset based on several values.`,
  type: 'copy',
};

export const searchField: Field = {
  label: 'Search field',
  key: 'searchField',
  type: 'string',
  helpText: 'Select the field based on which the asset should be found.',
  required: true,
  choices: [
    { value: 'id', sample: 'id', label: 'Asset ID' },
    { value: 'externalId', sample: 'externalId', label: 'External ID' },
  ],
  // altersDynamicFields: true,
};

const defaultSearchOperatorChoice = { value: '{0}={1}', sample: '{0}={1}', label: 'Equals' };
const searchOperatorChoices = [
  defaultSearchOperatorChoice,
]; // getOperatorChoices(z, bundle, contentTypeId, searchField); - TODO allow other operators

export const searchPattern: Field = {
  label: 'Search operator',
  key: 'searchPattern',
  type: 'string',
  helpText: 'Select how the search value should be matched.',
  required: true,
  choices: searchOperatorChoices,
  default: defaultSearchOperatorChoice.value,
  // altersDynamicFields: true,
};

export const searchValue: Field = {
  label: 'Search value',
  key: 'searchValue',
  helpText: 'Value to match in the search field. The value must match exactly.',
  type: 'string',
  required: true,
  altersDynamicFields: false,
};
