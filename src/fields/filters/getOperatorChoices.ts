import { getFieldType } from './getFieldType';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';

export async function getOperatorChoices(z: ZObject, bundle: KontentBundle<{}>, contentTypeId: string, field: string) {
  if (!field) {
    return [
      { value: '{0}={1}', sample: '{0}={1}', label: 'Equals' },
    ];
  }

  const fieldType = await getFieldType(z, bundle, contentTypeId, field);

  switch (fieldType) {
    case 'id':
      return [
        { value: '{0}={1}', sample: '{0}={1}', label: 'Equals' },
      ];

    case 'text':
    case 'url_slug':
    case 'custom':
      return [
        { value: '{0}={1}', sample: '{0}={1}', label: 'Equals' },
        { value: '{0}[range]={1},{1}~', sample: '{0}[range]={1},{1}~', label: 'Starts with' },
      ];

    case 'multiple_choice':
    case 'modular_content':
    case 'taxonomy':
      return [
        { value: '{0}[contains]={1}', sample: '{0}[contains]={1}', label: 'Contains the value' },
        { value: '{0}[any]={1}', sample: '{0}[any]={1}', label: 'Contains any value from a list <value 1>,<value 2>' },
        { value: '{0}[all]={1}', sample: '{0}[all]={1}', label: 'Contains all values from a list <value 1>,<value 2>' },
      ];

    case 'number':
      return [
        { value: '{0}={1}', sample: '{0}={1}', label: 'Equals =' },
        { value: '{0}[lt]={1}', sample: '{0}[lt]={1}', label: 'Less than <' },
        { value: '{0}[lte]={1}', sample: '{0}[lte]={1}', label: 'Less than or equal <=' },
        { value: '{0}[gt]={1}', sample: '{0}[gt]={1}', label: 'Greater than >' },
        { value: '{0}[gte]={1}', sample: '{0}[gte]={1}', label: 'Greater than or equal >=' },
        { value: '{0}[range]={1}', sample: '{0}[range]={1}', label: 'Range <from>,<to>' },
        { value: '{0}[in]={1}', sample: '{0}[in]={1}', label: 'Any of listed values <value 1>,<value 2>' },
      ];
    default:
      return [];
  }
}
