import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getLanguages = (z: ZObject, bundle: KontentBundle<{}>) =>
  createManagementClient(z, bundle)
    .listLanguages()
    .toAllPromise()
    .then(res => res.data.items);
