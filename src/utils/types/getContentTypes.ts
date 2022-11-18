import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { createDeliveryClient } from '../kontentServices/deliverClient';

export const getContentTypes = async (z: ZObject, bundle: KontentBundle<{}>) =>
  createDeliveryClient(z, bundle)
    .types()
    .queryConfig({ usePreviewMode: true })
    .toAllPromise()
    .then(res => res.data.items);
