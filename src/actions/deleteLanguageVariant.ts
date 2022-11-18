import { getLanguageField } from '../fields/getLanguageField';
import { itemSearchFields, ItemSearchFieldsOutputType } from '../fields/filters/itemSearchFields';
import { contentItemSample } from '../fields/samples/contentItemSample';
import { ContentItemOutputFields, contentItemOutputFields } from '../fields/output/contentItemOutputFields';
import { findItemByIdentifier } from '../utils/items/get/findItemByIdentifier';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { deleteVariant } from '../utils/items/delete/deleteVariant';
import { getVariant } from '../utils/items/get/getVariant';
import { getItemResult } from '../utils/items/get/getItemResult';

async function execute(z: ZObject, bundle: KontentBundle<InputData>): Promise<ContentItemOutputFields> {
  const searchField = bundle.inputData.searchField;
  const searchValue = bundle.inputData.searchValue;

  // Check existing content item, it may be available through the find action
  const existingItem = searchField && searchValue && await findItemByIdentifier(z, bundle, searchField, searchValue);
  if (!existingItem) {
    throw new z.errors.HaltedError('Skipped, item not found.');
  }

  const existingVariant = await getVariant(z, bundle, existingItem.id, bundle.inputData.languageId);
  if (!existingVariant) {
    throw new z.errors.HaltedError('Skipped, language variant not found.');
  }

  const statusCode = await deleteVariant(z, bundle, { ...bundle.inputData, itemId: existingItem.id });
  if (statusCode !== 204) {
    throw new z.errors.HaltedError(`Skipped, Kontent responded with ${statusCode}.`);
  }

  return await getItemResult(z, bundle, existingItem, existingVariant, false);
}

export const deleteLanguageVariant = {
  noun: 'Delete language variant',
  display: {
    hidden: false,
    important: false,
    description: 'Deletes an existing language variant using Kontent Management API.',
    label: 'Delete Language Variant',
  },
  key: 'delete_variant',
  operation: {
    perform: execute,
    inputFields: [
      getLanguageField({ required: true }),
      ...itemSearchFields,
    ],
    sample: contentItemSample,
    outputFields: contentItemOutputFields,
  },
};

type InputData = Readonly<{
  languageId: string;
}> & ItemSearchFieldsOutputType;
