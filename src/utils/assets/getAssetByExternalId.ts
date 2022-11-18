import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getAssetByExternalId = async (z: ZObject, bundle: KontentBundle<{}>, externalId: string) =>
  createManagementClient(z, bundle)
    .viewAsset()
    .byAssetExternalId(externalId)
    .toPromise()
    .then(res => res.data);
