import { getLanguageField } from '../fields/getLanguageField';
import { itemSearchFields, ItemSearchFieldsOutputType } from '../fields/filters/itemSearchFields';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { contentItemSample } from '../fields/samples/contentItemSample';
import { findContentItem } from '../utils/items/get/findContentItem';
import { getContentTypeField } from '../fields/getContentTypeField';
import { ContentItemOutputFields, contentItemOutputFields } from '../fields/output/contentItemOutputFields';

const execute = (z: ZObject, bundle: KontentBundle<InputData>): Promise<Output> =>
  findContentItem(z, bundle);

type Output = ReadonlyArray<ContentItemOutputFields>;

export default {
  noun: 'Content item search',
  display: {
    hidden: false,
    description: 'Finds a content item matching the provided parameters. If more items match, it returns the first found item.',
    label: 'Find Content Item',
  },
  key: 'find_item',
  operation: {
    perform: execute,
    inputFields: [
      getLanguageField({ required: true }),
      getContentTypeField({ required: true, altersDynamicFields: true }),
      ...itemSearchFields,
    ],
    sample: contentItemSample,
    outputFields: contentItemOutputFields,
  },
} as const;

export type InputData = Readonly<{
  languageId: string;
  contentTypeId: string;
}> & ItemSearchFieldsOutputType;
