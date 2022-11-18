import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createManagementClient } from '../kontentServices/managementClient';

export const getAsset = (z: ZObject, bundle: KontentBundle<{}>, assetId: string) =>
  createManagementClient(z, bundle)
    .viewAsset()
    .byAssetId(assetId)
    .toPromise()
    .then(res => res.data);
