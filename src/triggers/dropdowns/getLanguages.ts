import { getLanguages } from '../../utils/languages/getLanguages';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { OutputField } from '../../fields/output/outputField';
import { OutputFromOutputFields } from '../../fields/output/outputFromOutputFields';

const execute = (z: ZObject, bundle: KontentBundle<{}>): Promise<Output> =>
  getLanguages(z, bundle)
    .then(res => res
      .filter(l => l.isActive)
      .map(l => ({ id: l.id, name: l.name, codename: l.codename })),
    );

const outputFields = [
  {
    key: 'id',
    label: 'Language ID',
    type: 'string',
  },
  {
    key: 'name',
    label: 'Name',
    type: 'string',
  },
  {
    key: 'codename',
    label: 'Codename',
    type: 'string',
  },
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>

export default {
  noun: 'Language',
  display: {
    hidden: true,
    important: false,
    description: 'Gets languages for the input dropdown, in the order, in which they are defined in Kontent.ai.',
    label: 'Get Languages',
  },
  key: 'get_languages',
  operation: {
    perform: execute,
    sample: {
      id: '00000000-0000-0000-0000-000000000000',
      codename: 'en-US',
      name: 'English - United States',
    },
    outputFields,
  },
} as const;
