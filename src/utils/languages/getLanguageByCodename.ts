import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getLanguageByCodename = (z: ZObject, bundle: KontentBundle<{}>, codename: string) =>
  createManagementClient(z, bundle)
    .viewLanguage()
    .byLanguageCodename(codename)
    .toPromise()
    .then(res => res.data);
