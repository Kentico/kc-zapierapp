import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { getContentTypes } from '../../utils/types/getContentTypes';
import { OutputField } from '../../fields/output/outputField';
import { OutputFromOutputFields } from '../../fields/output/outputFromOutputFields';

const execute = async (z: ZObject, bundle: KontentBundle<{}>): Promise<Output> =>
  getContentTypes(z, bundle)
    .then(res => res.map(t => ({
      id: t.system.id,
      name: t.system.name,
      codename: t.system.codename,
      lastModified: t.system.lastModified?.toString(),
    })));

const outputFields = [
  {
    key: 'codename',
    label: 'Content type codename',
    type: 'string',
  },
  {
    key: 'lastModified',
    label: 'Last modified',
    type: 'datetime',
  },
  {
    key: 'id',
    label: 'Content type ID',
    type: 'string',
  },
  {
    key: 'name',
    label: 'Content type name',
    type: 'string',
  },
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>;

export default {
  key: 'get_content_types',
  noun: 'Content type choice',
  display: {
    label: 'Get Content type choices',
    description: 'Gets content types for the input dropdown ordered by name.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform: execute,
    sample: {
      'elements': {},
      'system': {
        'codename': 'about_us',
        'last_modified': '2018-02-27T18:50:42.3012044Z',
        'id': 'b2c14f2c-6467-460b-a70b-bca17972a33a',
        'name': 'About us',
      },
      'id': 'b2c14f2c-6467-460b-a70b-bca17972a33a',
    },
    outputFields,
  },
};
