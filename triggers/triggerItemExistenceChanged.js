const getLanguageField = require('../fields/getLanguageField');
const getSampleItemExistencePayload = require('../fields/samples/getSampleItemExistencePayload');
const getTriggerSampleOutput = require('../fields/samples/getTriggerSampleOutput');
const getContentTypeFieldForSamples = require('../fields/getContentTypeFieldForSamples');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const makeHookItemOutput = require('./makeHookItemOutput');
const hookLabel = 'Variant Created, Deleted or Restored';
const events = {
    create: 'Create',
    archive: 'Delete',
    restore: 'Restore'
};

async function subscribeHook(z, bundle) {
    //If no events were selected, respond to all of them
    let watchedEvents = bundle.inputData.watchedEvents;
    if (!watchedEvents) watchedEvents = Object.keys(events);

    const data = {
        // bundle.targetUrl has the Hook URL this app should call when a recipe is created.
        name: `${bundle.inputData.name || hookLabel} (Zapier)`,
        url: bundle.targetUrl,
        secret: getSecret(z, bundle),
        triggers: {
            management_api_content_changes: [
                {
                    type: 'content_item_variant',
                    operations: watchedEvents
                }
            ]
        }
    };

    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/webhooks`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {},
        body: JSON.stringify(data)
    };

    const response = await z.request(options);
    handleErrors(response);

    const webhook = z.JSON.parse(response.content);

    return webhook;
}

async function parsePayload(z, bundle) {
    if (!hasValidSignature(z, bundle)) {
        throw new Error('Unable to verify webhook signature.');
    }

    const items = bundle.cleanedRequest.data.items;
    const item = items[0];
    if (!item) {
        throw z.errors.HaltedError('Skipped, no items found.');
    }

    const targetLanguageId = bundle.inputData.languageId;
    if (targetLanguageId && (item.language.id !== targetLanguageId)) {
        throw new z.errors.HaltedError('Skipped, language not matched.');
    }

    const payloadFunc = () => { return bundle.cleanedRequest; };

    //If responding to an 'archive' operation, variant isn't available anymore
    if (bundle.cleanedRequest.message.operation === 'archive') {
        return await makeHookItemOutput(z, bundle, null, payloadFunc);
    }
    else {
        return await makeHookItemOutput(z, bundle, [item], payloadFunc);
    }
}

module.exports = {
    key: 'management_item_existence_changed',
    noun: hookLabel,
    display: {
        label: hookLabel,
        description: 'Triggers when a language variant is created, deleted, or restored.'
    },
    operation: {
        inputFields: [
            {
                label: 'Webhook name',
                helpText: 'Enter a webhook name which will appear in the Kentico Kontent admin UI.',
                key: 'name',
                type: 'string',
            },
            {
                label: 'Events to watch',
                helpText: 'Fires only when these events are performed on a language variant. Leave blank for all events.',
                key: 'watchedEvents',
                list: true,
                choices: events
            },
            getLanguageField({
                helpText: 'Fires only for variants of the given languages. Leave blank for all languages.',
            }),
            getContentTypeFieldForSamples
        ],
        type: 'hook',

        performSubscribe: subscribeHook,
        performUnsubscribe: unsubscribeHook,

        perform: parsePayload,
        performList: (z, bundle) => { return getTriggerSampleOutput(z, bundle, getSampleItemExistencePayload) },

        sample: {
            data: {
                items: [
                    {
                        item: {
                            id: '42c21e82-0772-4d79-a6b3-c916e51b24ff'
                        },
                        language: {
                            id: '00000000-0000-0000-0000-000000000000'
                        }
                    }
                ]
            },
            message: {
                id: 'a268da50-b3c5-4d09-9b36-6587c8dea500',
                project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
                type: 'content_item_variant',
                operation: 'restore',
                api_name: 'content_management',
                created_timestamp: '2019-07-18T10:52:33.1059256Z',
                webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732'
            }
        }
    }
};
