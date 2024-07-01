import { ZObject } from 'zapier-platform-core';
import { ManagementClient } from '@kontent-ai/management-sdk';
import { KontentBundle } from '../../types/kontentBundle';
import { createHttpService } from './httpService';

export const createManagementClient = (z: ZObject, bundle: KontentBundle<{}>) =>
  new ManagementClient({
    apiKey: bundle.authData.cmApiKey,
    environmentId: bundle.authData.projectId,
    httpService: createHttpService(z),
  });
