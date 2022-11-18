import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getLanguageByExternalId = async (z: ZObject, bundle: KontentBundle<{}>, externalId: string) =>
  createManagementClient(z, bundle)
    .viewLanguage()
    .byExternalId(externalId)
    .toPromise()
    .then(res => res.data);
