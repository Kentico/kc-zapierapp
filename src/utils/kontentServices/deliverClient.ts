import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { DeliveryClient } from '@kontent-ai/delivery-sdk';
import { createHttpService } from './httpService';

export const createDeliveryClient = (z: ZObject, bundle: KontentBundle<{}>) =>
  new DeliveryClient({
    environmentId: bundle.authData.projectId,
    secureApiKey: bundle.authData.secureApiKey,
    httpService: createHttpService(z),
    previewApiKey: bundle.authData.previewApiKey,
    defaultQueryConfig: {
      // Without this flag the secureApiKey is not used
      // When calling preview API you need to disabled secure mode (otherwise the SDK throws an error)
      // client....queryConfig({ usePreviewMode: true, useSecuredMode: false });
      useSecuredMode: bundle.authData.secureApiKey ? true : undefined,
    },
  });
