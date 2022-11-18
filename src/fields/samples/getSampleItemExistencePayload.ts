import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { IContentItem } from '@kontent-ai/delivery-sdk';

export const getSampleItemExistencePayload = (z: ZObject, bundle: KontentBundle<ExpectedInputData>, sampleItem: IContentItem) => ({
  data: {
    items: [
      {
        item: {
          id: sampleItem ? sampleItem.system.id : '42c21e82-0772-4d79-a6b3-c916e51b24ff',
        },
        language: {
          id: bundle.inputData.languageId ? bundle.inputData.languageId
            : '00000000-0000-0000-0000-000000000000',
        },
      },
    ],
  },
  message: {
    id: 'a268da50-b3c5-4d09-9b36-6587c8dea500',
    project_id: bundle.authData.projectId,
    type: 'content_item_variant',
    operation: 'restore',
    api_name: 'content_management',
    created_timestamp: new Date().toJSON(),
    webhook_url: bundle.targetUrl ? bundle.targetUrl : 'https://hooks.zapier.com/hooks/standard/47991d003732',
  },
});

type ExpectedInputData = Readonly<{
  languageId?: string;
}>;
