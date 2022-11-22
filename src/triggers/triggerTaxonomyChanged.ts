import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { getSecret } from '../utils/getSecret';
import { hasValidSignature } from '../utils/hasValidSignature';
import { createDeliveryClient } from '../utils/kontentServices/deliverClient';
import { taxonomyGroupSample } from '../fields/samples/taxonomyGroupSample';
import { getSampleTaxonomyPayload } from '../fields/samples/getSampleTaxonomyPayload';
import { unsubscribeHook } from '../utils/unsubscribeHook';
import { createManagementClient } from '../utils/kontentServices/managementClient';
import { WebhookContracts } from '@kontent-ai/management-sdk';

const hookLabel = 'Taxonomy Group Changed';
const numberOfSampleItems = 3;
const events = {
  archive: 'Delete',
  restore: 'Restore',
  upsert: 'Create/Update',
} as const satisfies Readonly<Partial<Record<WebhookContracts.WebhookWorkflowStepOperationContract, string>>>;

const isValidEvent = (event: string): event is WebhookContracts.WebhookWorkflowStepOperationContract =>
  Object.keys<string, string>(events).includes(event);

async function subscribeHook(z: ZObject, bundle: KontentBundle<InputData>) {
  const watchedEvents = bundle.inputData.watchedEvents?.filter(isValidEvent) ?? Object.keys(events);

  return createManagementClient(z, bundle)
    .addWebhook()
    .withData({
      // bundle.targetUrl has the Hook URL this app should call when a recipe is created.
      name: `${bundle.inputData.name || hookLabel} (Zapier)`,
      url: bundle.targetUrl ?? '',
      secret: getSecret(z, bundle),
      triggers: {
        delivery_api_content_changes: [
          {
            type: 'taxonomy',
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

  const hookPayload = bundle.cleanedRequest;
  const taxonomies = hookPayload.data.taxonomies;
  const group = taxonomies[0];
  if (!group) {
    throw new z.errors.HaltedError('Skipped, no taxonomy group found.');
  }

  //TODO make group dynamic input, check id instead
  const targetCodename = bundle.inputData.targetCodename;
  if (targetCodename && (group.codename !== targetCodename)) {
    throw new z.errors.HaltedError('Skipped, codename not matched.');
  }

  return [bundle.cleanedRequest];
}

async function getSampleItems(z: ZObject, bundle: KontentBundle<InputData>) {
  const targetCodename = bundle.inputData.targetCodename;

  const promise = targetCodename
    ? createDeliveryClient(z, bundle)
      .taxonomy(targetCodename)
      .toPromise()
      .then(res => [res.data.taxonomy])
    : createDeliveryClient(z, bundle)
      .taxonomies()
      .toAllPromise()
      .then(res => res.data.items);

  return promise
    .then(res => res.length ? res.slice(0, numberOfSampleItems) : [taxonomyGroupSample])
    .then(res => res.map(g => getSampleTaxonomyPayload(bundle, g)));
}

export default {
  key: 'deliver_taxonomy_changed',
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: 'Triggers when a taxonomy group is created, deleted, updated, or restored.',
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
        helpText: 'Fires only when these events are performed on a taxonomy group. Leave blank for all events.',
        key: 'watchedEvents',
        list: true,
        choices: events,
      },
      {
        label: 'Taxonomy group code name',
        helpText: 'Fires only for the group of the give code name. Leave blank for all taxonomy groups.',
        key: 'targetCodename',
        type: 'string',
      },
    ],
    type: 'hook',

    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,

    perform: parsePayload,
    performList: getSampleItems,

    sample: {
      data: {
        items: [
          {
            id: 'e113e464-bffb-4fbd-a29b-47991d003732',
            codename: 'my_article',
            language: 'en-US',
            type: 'article',
          },
        ],
        taxonomies: [
          {
            id: '13145328-b946-4e47-9c9d-6f40c7aaeaef',
            codename: 'article_tags',
          },
        ],
      },
      message: {
        id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
        project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
        type: 'taxonomy',
        operation: 'upsert',
        api_name: 'delivery_production',
        created_timestamp: '2019-07-18T15:07:17.6823904Z',
        webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732',
      }
    },
  },
};

type InputData = Readonly<{
  name?: string;
  watchedEvents?: ReadonlyArray<string>;
  targetCodename?: string;
}>;
