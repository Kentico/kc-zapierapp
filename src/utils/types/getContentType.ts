import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getContentType = (z: ZObject, bundle: KontentBundle<{}>, contentTypeId: string) =>
  createManagementClient(z, bundle)
    .viewContentType()
    .byTypeId(contentTypeId)
    .toPromise()
    .then(res => res.data);
