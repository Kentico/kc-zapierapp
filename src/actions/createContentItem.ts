import { getLanguageField } from '../fields/getLanguageField';
import { getContentTypeField } from '../fields/getContentTypeField';
import { ElementFields, getItemElementFields } from '../fields/elements/getItemElementFields';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { Field } from '../fields/field';
import { contentItemSample } from '../fields/samples/contentItemSample';
import { ContentItemOutputFields, contentItemOutputFields } from '../fields/output/contentItemOutputFields';
import { createItem } from '../utils/items/create/createItem';
import { upsertVariant } from '../utils/items/update/upsertVariant';
import { getItemResult } from '../utils/items/get/getItemResult';

const itemNameField: Field = {
  required: true,
  label: 'Content item name',
  helpText: 'Name of the content item. Displays in content inventory. Shared by all language variants.',
  key: 'name',
  type: 'string',
};

const externalIdField: Field = {
  required: false,
  label: 'External ID',
  helpText: 'Any unique identifier for the item in the external system. Can be used to link the content item for future updates. [Read more about external ID ...](https://developer.kontent.ai/v1/reference#content-management-api-reference-by-external-id)',
  key: 'externalId',
  type: 'string',
};

const elementsInfoField: Field = {
  label: 'Elements',
  helpText: `#### Content item variant elements
                
The following inputs represent elements of a chosen content type as defined in Kontent.ai. Element data is stored per language version.

[Read more about elements ...](https://kontent.ai/learn/reference/management-api-v2/#operation/delete-a-content-type-snippet)`,
  key: 'elements_header',
  type: 'copy',
};

const execute = async (z: ZObject, bundle: KontentBundle<InputData>): Promise<Output> => {
  const item = await createItem(z, bundle, bundle.inputData);
  const variant = await upsertVariant(z, bundle, { ...bundle.inputData, itemId: item.id });
  return getItemResult(z, bundle, item, variant, false);
};

export const createContentItem = {
  noun: 'New content item',
  display: {
    hidden: false,
    important: true,
    description: 'Creates a content item and language variant using Kontent Management API. The created item is not published, but only in the Draft workflow step.',
    label: 'Create Content Item',
  },
  key: 'create_item',
  operation: {
    perform: execute,
    inputFields: [
      getLanguageField({ required: true }),
      getContentTypeField({ required: true, altersDynamicFields: true }),
      itemNameField,
      externalIdField,
      elementsInfoField,
      (z: ZObject, bundle: KontentBundle<InputData>) => getItemElementFields(z, bundle, bundle.inputData.contentTypeId),
    ],
    sample: contentItemSample,
    outputFields: contentItemOutputFields,
  },
};

type InputData = Readonly<{
    languageId: string;
    contentTypeId: string;
    name: string;
    externalId?: string;
    elements_header?: string;
}> & ElementFields;

type Output = ContentItemOutputFields;
