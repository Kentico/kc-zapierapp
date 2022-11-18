import { getContentTypeElements } from '../elements/getContentTypeElements';
import { ElementsPrefix, SystemPrefix } from '../constants';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { getOperatorChoices } from './getOperatorChoices';
import { Field } from '../field';

const searchInfo = {
  label: 'Search info',
  key: 'searchInfo',
  helpText: `### Search by field
    
You can search the item by a particular field value.`,
  type: 'copy',
};

const searchField = async (z: ZObject, bundle: KontentBundle<{ contentTypeId: string }>): Promise<ReadonlyArray<Field>> =>{
  const elements = await getContentTypeElements(z, bundle, bundle.inputData.contentTypeId);
  const baseChoices = [
    { value: 'id', sample: 'id', label: 'Item ID' },
    { value: 'externalId', sample: 'externalId', label: 'External ID' },
    { value: `${SystemPrefix}codename`, sample: `${SystemPrefix}codename`, label: 'Code name' },
  ];

  const elementsChoices = elements
    .flatMap(element => {
      switch (element.type) {
        case 'text':
        case 'custom':
        case 'url_slug':
        case 'multiple_choice':
        case 'modular_content':
        case 'number':
          return [{
            value: `${ElementsPrefix}${element.codename}`,
            sample: `${ElementsPrefix}${element.codename}`,
            label: element.name || element.codename || '',
          }];
        case 'taxonomy':
          return [{
            value: `${ElementsPrefix}${element.codename}`,
            sample: `${ElementsPrefix}${element.codename}`,
            label: element.codename || '',
          }];
        default:
          return [];
      }
    });

  return [{
    label: 'Search field',
    key: 'searchField',
    type: 'string',
    helpText: 'Select the field based on which the item should be found.',
    required: true,
    choices: [...baseChoices, ...elementsChoices],
    altersDynamicFields: true,
  }];
};

const searchOperator = (z: ZObject, bundle: KontentBundle<{ contentTypeId: string; searchField: string }>): Promise<ReadonlyArray<Field>> =>
  getOperatorChoices(z, bundle, bundle.inputData.contentTypeId, bundle.inputData.searchField)
    .then(choices => [{
      label: 'Search operator',
      key: 'searchPattern',
      type: 'string',
      helpText: 'Select how the search value should be matched.',
      required: true,
      choices,
      default: choices[0]?.value || '',
      altersDynamicFields: true,
    }]);

const searchValue: Field = {
  label: 'Search value',
  key: 'searchValue',
  helpText: 'Value to match in the search field. The value must match exactly.',
  type: 'string',
  required: true,
  altersDynamicFields: false,
};

export const itemSearchFields = [searchInfo, searchField, searchOperator, searchValue] as const;

export type ItemSearchFieldsOutputType = Readonly<{
  searchValue: string;
  searchPattern: string;
  searchField: string;
  searchInfo?: string;
}>;
