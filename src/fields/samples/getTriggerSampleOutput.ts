import { ZObject } from 'zapier-platform-core';
import { getAllItemsDelivery } from '../../utils/items/get/getAllItemsDelivery';
import { KontentBundle } from '../../types/kontentBundle';
import { IContentItem } from '@kontent-ai/delivery-sdk';
import { getContentType } from '../../utils/types/getContentType';
import { getLanguage } from '../../utils/languages/getLanguage';

type ExpectedInputData = Readonly<{
  contentTypeId?: string;
  languageId?: string;
}>;

export const getTriggerSampleOutput = async (z: ZObject, bundle: KontentBundle<ExpectedInputData>) => {
  const allItems = await getAllItemsDelivery(z, bundle);
  if (!allItems) {
    return null;
  }

  const filteredByType = bundle.inputData.contentTypeId
    ? await filterByContentType(z, bundle, bundle.inputData.contentTypeId, allItems)
    : allItems;

  const filteredByLanguage = bundle.inputData.languageId
    ? await filterByLanguage(z, bundle, bundle.inputData.languageId, filteredByType)
    : filteredByType;

  return filteredByLanguage
    .slice(0, 3);
};

const filterByContentType = async (z: ZObject, bundle: KontentBundle<{}>, typeId: string, items: ReadonlyArray<IContentItem>) => {
  const type = await getContentType(z, bundle, typeId);
  const matches = items.filter(i => i.system.type === type.codename);

  return matches.length
    ? matches
    : items;
};

const filterByLanguage = async (z: ZObject, bundle: KontentBundle<{}>, languageId: string, items: ReadonlyArray<IContentItem>) => {
  const language = await getLanguage(z, bundle, languageId);
  const matches = items.filter(i => i.system.language === language.codename);

  return matches.length
    ? matches
    : items;
};
