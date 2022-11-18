import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getLanguage = async (z: ZObject, bundle: KontentBundle<{}>, languageId: string) =>
  createManagementClient(z, bundle)
    .viewLanguage()
    .byLanguageId(languageId)
    .toPromise()
    .then(res => res.data);
