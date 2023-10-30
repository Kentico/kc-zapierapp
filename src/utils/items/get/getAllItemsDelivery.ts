import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { createDeliveryClient } from '../../kontentServices/deliverClient';

export const getAllItemsDelivery = async (z: ZObject, bundle: KontentBundle<{}>) =>
  createDeliveryClient(z, bundle)
    .itemsFeed()
    .queryConfig({ usePreviewMode: true, useSecuredMode: false })
    .toAllPromise()
    .then(res => res.data.items);
