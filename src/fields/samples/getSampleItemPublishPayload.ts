import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { IContentItem } from '@kontent-ai/delivery-sdk';

export const getSampleItemPublishPayload = (z: ZObject, bundle: KontentBundle<{}>, sampleItem: IContentItem) => ({
  data: {
    items: [
      {
        id: sampleItem.system.id,
        codename: sampleItem.system.codename,
        language: sampleItem.system.language,
        type: sampleItem.system.type
      }
    ]
  },
  message: {
    id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
    project_id: bundle.authData.projectId,
    type: 'content_item_variant',
    operation: 'publish',
    api_name: 'delivery_production',
    created_timestamp: new Date().toJSON(),
    webhook_url: bundle.targetUrl ? bundle.targetUrl : 'https://hooks.zapier.com/hooks/standard/47991d003732'
  }
});
