import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { createManagementClient } from '../../kontentServices/managementClient';

export const getVariant = async (z: ZObject, bundle: KontentBundle<{}>, itemId: string, languageId: string) =>
  createManagementClient(z, bundle)
    .viewLanguageVariant()
    .byItemId(itemId)
    .byLanguageId(languageId)
    .toPromise()
    .then(res => res.data);
