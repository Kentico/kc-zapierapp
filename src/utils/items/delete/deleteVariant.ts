import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { createManagementClient } from '../../kontentServices/managementClient';

type Params = Readonly<{
  itemId: string;
  languageId: string;
}>;

export const deleteVariant = async (z: ZObject, bundle: KontentBundle<{}>, params: Params) =>
  createManagementClient(z, bundle)
    .deleteLanguageVariant()
    .byItemId(params.itemId)
    .byLanguageId(params.languageId)
    .toPromise()
    .then(res => res.debug.response.status);
