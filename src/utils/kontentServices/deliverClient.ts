import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { DeliveryClient } from '@kontent-ai/delivery-sdk';
import { createHttpService } from './httpService';

export const createDeliveryClient = (z: ZObject, bundle: KontentBundle<{}>) =>
  new DeliveryClient({
    projectId: bundle.authData.projectId,
    secureApiKey: bundle.authData.secureApiKey,
    httpService: createHttpService(z),
    previewApiKey: bundle.authData.previewApiKey,
  });
