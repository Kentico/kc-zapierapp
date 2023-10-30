import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { findItemByIdentifier } from './findItemByIdentifier';
import { getItemVariant } from './getItemVariant';
import { getItemResult } from './getItemResult';
import { getFilterParams } from './getFilterParams';
import { getContentType } from '../../types/getContentType';
import { createDeliveryClient } from '../../kontentServices/deliverClient';
import { getContentItem } from './getContentItem';
import { getLanguage } from '../../languages/getLanguage';

async function findContentItemByIdentifier(z: ZObject, bundle: KontentBundle<ExpectedInputData>) {
  const item = await findItemByIdentifier(z, bundle, bundle.inputData.searchField, bundle.inputData.searchValue);
  if (!item) {
    // Not found
    return null;
  }

  const variant = await getItemVariant(z, bundle, item.id, bundle.inputData.languageId || '');
  if (!variant) {
    // Not found
    return null;
  }

  // Found
  const contentItem = await getItemResult(z, bundle, item, variant);

  return [contentItem];
}

async function findContentItemByElement(z: ZObject, bundle: KontentBundle<ExpectedInputData>) {
  const searchParams = getFilterParams(bundle.inputData);

  // Translate IDs to code names for use with Delivery API
  const contentType = bundle.inputData.contentTypeId && await getContentType(z, bundle, bundle.inputData.contentTypeId);
  const contentTypeCodename = contentType && contentType.codename;

  const language = bundle.inputData.languageId && await getLanguage(z, bundle, bundle.inputData.languageId);
  const languageCode = language && language.codename;

  const queryWithoutLanguage = createDeliveryClient(z, bundle)
    .itemsFeed()
    .withParameters(searchParams.map(([paramKey, paramValue]) => ({ getParam: () => `${paramKey}=${paramValue}` })))
    .types(contentTypeCodename ? [contentTypeCodename] : [])
    .queryConfig({ usePreviewMode: true, useSecuredMode: false })
    .limitParameter(1);

  const query = languageCode
    ? queryWithoutLanguage.languageParameter(languageCode)
    : queryWithoutLanguage;

  return query
    .toPromise()
    .then(res => res.data.items)
    .then(async ([firstItem]) => firstItem
      ? [await getContentItem(z, bundle, firstItem.system.id, bundle.inputData.languageId || '')].filter(notNull)
      : []);
}

export const findContentItem = (z: ZObject, bundle: KontentBundle<ExpectedInputData>) =>
  findContentItemByIdentifier(z, bundle)
    .then(res => res ?? findContentItemByElement(z, bundle));

type ExpectedInputData = Readonly<{
  languageId?: string;
  contentTypeId?: string;
  searchField: string;
  searchValue: string;
  searchPattern: string
}>;

const notNull = <T>(v: T | null): v is T => v !== null;
