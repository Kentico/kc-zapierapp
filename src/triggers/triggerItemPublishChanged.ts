import { getSecret } from '../utils/getSecret';
import { hasValidSignature } from '../utils/hasValidSignature';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { createManagementClient } from '../utils/kontentServices/managementClient';
import { unsubscribeHook } from '../utils/unsubscribeHook';
import { getLanguage } from '../utils/languages/getLanguage';
import { getTriggerSampleOutput } from '../fields/samples/getTriggerSampleOutput';
import { getSampleItemPublishPayload } from '../fields/samples/getSampleItemPublishPayload';
import { getLanguageField } from '../fields/getLanguageField';
import { getContentTypeFieldForSamples } from '../fields/getContentTypeFieldForSamples';
import { parseWebhookWorkflowTrigger } from '../utils/webhooks/parseWebhookWorkflowTrigger';

const hookLabel = 'Variant Published Status Changed';

const events = {
  publish: 'Publish',
  unpublish: 'Unpublish',
} as const;

async function subscribeHook(z: ZObject, bundle: KontentBundle<InputData>) {
  //If no events were selected, respond to all of them
  const watchedEvents = parseWebhookWorkflowTrigger(bundle.inputData.watchedEvents) ?? Object.keys(events);

  if (!bundle.targetUrl) {
    throw new z.errors.Error('Missing targetUrl.');
  }

  return createManagementClient(z, bundle)
    .addWebhook()
    .withData({
      name: `${bundle.inputData.name || hookLabel} (Zapier)`,
      url: bundle.targetUrl,
      secret: getSecret(z, bundle),
      enabled: true,
      triggers: {
        delivery_api_content_changes: [
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
  if (targetLanguageId) {
    //language of POSTed item is a codename, get ID
    const language = await getLanguage(z, bundle, targetLanguageId);
    if (language.codename && (item.language !== language.codename)) {
      throw new z.errors.HaltedError('Skipped, language not matched.');
    }
  }
  return [bundle.cleanedRequest];
}

export default {
  key: 'deliver_variant_publish_changed',
  noun: hookLabel,
  display: {
    important: true,
    label: hookLabel,
    description: 'Triggers when a language variant is published or unpublished.',
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
        helpText: 'Fires only when these events are performed on a language. Leave blank for all events.',
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
        .then(res => res?.map(i => getSampleItemPublishPayload(z, bundle, i))),

    sample: {
      data: {
        items: [
          {
            id: 'e113e464-bffb-4fbd-a29b-47991d003732',
            codename: 'this_article_changed',
            language: 'en-US',
            type: 'article',
          },
        ],
      },
      message: {
        id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
        project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
        type: 'content_item_variant',
        operation: 'publish',
        api_name: 'delivery_production',
        created_timestamp: '2019-07-18T15:07:17.6823904Z',
        webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732',
      },
    },
  },
} as const;

export type InputData = Readonly<{
  name?: string;
  watchedEvents?: ReadonlyArray<string>;
  languageId?: string;
  contentTypeId?: string;
}>;
