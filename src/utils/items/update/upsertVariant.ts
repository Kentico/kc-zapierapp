import { createManagementClient } from '../../kontentServices/managementClient';
import { ExpectedInputData, getElementsForUpsert } from '../../elements/getElementsForUpsert';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';

type Params = Readonly<{
  itemId: string;
  languageId: string;
  contentTypeId: string;
}>;

export const upsertVariant = async (z: ZObject, bundle: KontentBundle<ExpectedInputData>, params: Params) => {
  const elements = await getElementsForUpsert(z, bundle, params.contentTypeId);

  return createManagementClient(z, bundle)
    .upsertLanguageVariant()
    .byItemId(params.itemId)
    .byLanguageId(params.languageId)
    .withData(builder => ({
      elements: elements.map(builder.any),
    }))
    .toPromise()
    .then(res => res.data);
};
