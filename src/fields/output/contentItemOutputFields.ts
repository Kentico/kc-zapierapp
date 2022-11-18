import { StandardizedSystemOutputFields, standardizedSystemOutputFields } from './standardizedSystemOutputFields';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { ElementsOutputFields, getElementOutputFields } from './getElementOutputFields';
import { OutputField } from './outputField';

export const contentItemOutputFields = [
  ...standardizedSystemOutputFields,
  (z: ZObject, bundle: KontentBundle<{ contentTypeId: string }>) =>
    getElementOutputFields(z, bundle, bundle.inputData.contentTypeId),
  {
    key: 'modular_content',
    type: 'string',
    label: 'Serialized linked items'
  } satisfies OutputField,
];

export type ContentItemOutputFields = StandardizedSystemOutputFields & ElementsOutputFields & Readonly<{ modular_content: string | undefined }>;
