import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { getSecret } from '../utils/getSecret';
import { hasValidSignature } from '../utils/hasValidSignature';
import { unsubscribeHook } from '../utils/unsubscribeHook';
import { getTriggerSampleOutput } from '../fields/samples/getTriggerSampleOutput';
import { getLanguageField } from '../fields/getLanguageField';
import { getSampleItemExistencePayload } from '../fields/samples/getSampleItemExistencePayload';
import { createManagementClient } from '../utils/kontentServices/managementClient';
import { parseWebhookContentChangeTrigger } from '../utils/webhooks/parseWebhookWorkflowTrigger';
import { getContentTypeFieldForSamples } from '../fields/getContentTypeFieldForSamples';

const hookLabel = 'Variant Created, Deleted or Restored';
const events = {
  create: 'Create',
  archive: 'Delete',
  restore: 'Restore',
} as const;

async function subscribeHook(z: ZObject, bundle: KontentBundle<InputData>) {
  //If no events were selected, respond to all of them
  const watchedEvents = parseWebhookContentChangeTrigger(bundle.inputData.watchedEvents) ?? Object.keys(events);

  if (!bundle.targetUrl) {
      throw new z.errors.Error('Missing targetUrl.');
  }

  return createManagementClient(z, bundle)
    .addWebhook()
    .withData({
      name: `${bundle.inputData.name || hookLabel} (Zapier)`,
      url: bundle.targetUrl,
      secret: getSecret(z, bundle),
      triggers: {
        management_api_content_changes: [
          {
            type: 'content_item_variant',
            operations: watchedEvents,
          },
        ],
      },
    })
    .toPromise()
    .then(res => res.data);
}

async function parsePayload(z: ZObject, bundle: KontentBundle<InputData>) {
  if (!hasValidSignature(z, bundle)) {
    throw new Error('Unable to verify webhook signature.');
  }

  const items = bundle.cleanedRequest.data.items;
  const item = items[0];
  if (!item) {
    throw new z.errors.HaltedError('Skipped, no items found.');
  }

  const targetLanguageId = bundle.inputData.languageId;
  if (targetLanguageId && (item.language.id !== targetLanguageId)) {
    throw new z.errors.HaltedError('Skipped, language not matched.');
  }

  return [bundle.cleanedRequest];
}

export default {
  key: 'management_item_existence_changed',
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: 'Triggers when a language variant is created, deleted, or restored.',
  },
  operation: {
    inputFields: [
      {
        label: 'Webhook name',
        helpText: 'Enter a webhook name which will appear in the Kontent.ai admin UI.',
        key: 'name',
        type: 'string',
      },
      {
        label: 'Events to watch',
        helpText: 'Fires only when these events are performed on a language variant. Leave blank for all events.',
        key: 'watchedEvents',
        list: true,
        choices: events,
      },
      getLanguageField({
        helpText: 'Fires only for variants of the given languages. Leave blank for all languages.',
      }),
      getContentTypeFieldForSamples,
    ],
    type: 'hook',

    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,

    perform: parsePayload,
    performList: (z: ZObject, bundle: KontentBundle<InputData>) =>
      getTriggerSampleOutput(z, bundle)
        .then(res => res?.map(i => getSampleItemExistencePayload(z, bundle, i))),

    sample: {
      data: {
        items: [
          {
            item: {
              id: '42c21e82-0772-4d79-a6b3-c916e51b24ff',
            },
            language: {
              id: '00000000-0000-0000-0000-000000000000',
            },
          },
        ],
      },
      message: {
        id: 'a268da50-b3c5-4d09-9b36-6587c8dea500',
        project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
        type: 'content_item_variant',
        operation: 'restore',
        api_name: 'content_management',
        created_timestamp: '2019-07-18T10:52:33.1059256Z',
        webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732',
      },
    },
  }
} as const;

export type InputData = Readonly<{
  name?: string;
  watchedEvents?: ReadonlyArray<string>;
  languageId?: string;
  contentTypeId?: string;
}>;
