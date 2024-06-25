import { ZObject } from 'zapier-platform-core';
import { hasValidSignature } from '../utils/hasValidSignature';
import { getWorkflowStepField } from '../fields/getWorkflowStepField';
import { getLanguageField } from '../fields/getLanguageField';
import { getContentTypeFieldForSamples } from '../fields/getContentTypeFieldForSamples';
import { unsubscribeHook } from '../utils/unsubscribeHook';
import { getTriggerSampleOutput } from '../fields/samples/getTriggerSampleOutput';
import { KontentBundle } from '../types/kontentBundle';
import { getSecret } from '../utils/getSecret';
import { getSampleWorkflowPayload } from '../fields/samples/getSampleWorkflowPayload';
import { createManagementClient } from '../utils/kontentServices/managementClient';


const hookLabel = 'Variant Workflow Step Changed';

async function subscribeHook(z: ZObject, bundle: KontentBundle<InputData>) {
  const stepIDs = bundle.inputData.workflowStepIds.map(i => ({ id: i }));

  return createManagementClient(z, bundle)
    .addWebhook()
    .withData({
      name: `${bundle.inputData.name || hookLabel} (Zapier)`,
      url: bundle.targetUrl ?? '',
      secret: getSecret(z, bundle),
      triggers: {
        workflow_step_changes: [
          {
            type: 'content_item_variant',
            transitions_to: stepIDs,
          },
        ],
      },
    })
    .toPromise()
    .then(res => ({ ...res.data }));
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

  const languageId = bundle.inputData.languageId;
  if (languageId && (item.language.id !== languageId)) {
    throw new z.errors.HaltedError('Skipped, language not matched.');
  }

  const workflowStepIds = bundle.inputData.workflowStepIds;
  if (workflowStepIds && (!workflowStepIds.includes(item.transition_to.id))) {
    throw new z.errors.HaltedError('Skipped, target step not matched.');
  }

  return [bundle.cleanedRequest];
}

export default {
  key: 'management_workflow_changed',
  noun: hookLabel,
  display: {
    label: hookLabel,
    description: 'Triggers when a language variant workflow step changes.',
  },
  operation: {
    inputFields: [
      {
        label: 'Webhook name',
        helpText: 'Enter a webhook name which will appear in the Kontent.ai admin UI.',
        key: 'name',
        type: 'string',
      },
      getWorkflowStepField({
        required: true,
        list: true,
        helpText: 'Fires for the selected workflow steps.',
      }),
      getLanguageField({
        helpText: 'Fires only for variants of the given languages. Leave blank for all languages.',
      }),
      getContentTypeFieldForSamples(),
    ],
    type: 'hook',

    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,

    perform: parsePayload,
    performList: (z: ZObject, bundle: KontentBundle<InputData>) =>
      getTriggerSampleOutput(z, bundle)
        .then(res => res?.map(i => getSampleWorkflowPayload(z, bundle, i))),

    sample: {
      data: {
        items: [
          {
            item: {
              id: 'e113e464-bffb-4fbd-a29b-47991d003732',
            },
            language: {
              id: '00000000-0000-0000-0000-000000000000',
            },
            transition_from: {
              id: '13145328-b946-4e47-9c9d-6f40c7aaeaef',
            },
            transition_to: {
              id: 'b4363ccd-8f21-45fd-a840-5843d7b7f008',
            },
          },
        ],
      },
      message: {
        id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
        project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
        type: 'content_item_variant',
        operation: 'change_workflow_step',
        api_name: 'content_management',
        created_timestamp: '2019-07-18T15:07:17.6823904Z',
        webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732',
      },
    },
  },
} as const;

type InputData = Readonly<{
  name?: string;
  workflowStepIds: ReadonlyArray<string>;
  languageId?: string;
  contentTypeId?: string;
}>;
