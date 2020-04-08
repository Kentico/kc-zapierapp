const getLanguageField = require('../fields/getLanguageField');
const getSampleItemPublishPayload = require('../fields/samples/getSampleItemPublishPayload');
const getTriggerSampleOutput = require('../fields/samples/getTriggerSampleOutput');
const getContentTypeFieldForSamples = require('../fields/getContentTypeFieldForSamples');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const getLanguage = require('../utils/languages/getLanguage');
const makeHookItemOutput = require('./makeHookItemOutput');
const hookLabel = 'Variant Published Status Changed';
const events = {
    publish: 'Publish',
    unpublish: 'Unpublish'
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
            delivery_api_content_changes: [
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
    if (targetLanguageId) {
        //language of POSTed item is a codename, get ID
        const language = await getLanguage(z, bundle, targetLanguageId);
        const languageCodename = language.codename;
        if (languageCodename && (item.language !== languageCodename)) {
            throw new z.errors.HaltedError('Skipped, language not matched.');
        }
    }

    return await makeHookItemOutput(z, bundle, [item], () => { return bundle.cleanedRequest });
}

module.exports = {
    key: 'deliver_variant_publish_changed',
    noun: hookLabel,
    display: {
        important: true,
        label: hookLabel,
        description: 'Triggers when a language variant is published or unpublished.'
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
                helpText: 'Fires only when these events are performed on a language. Leave blank for all events.',
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
        performList: (z, bundle) => { return getTriggerSampleOutput(z, bundle, getSampleItemPublishPayload) },

        sample: {
            data: {
                items: [
                    {
                        id: 'e113e464-bffb-4fbd-a29b-47991d003732',
                        codename: 'this_article_changed',
                        language: 'en-US',
                        type: 'article'
                    }
                ]
            },
            message: {
                id: 'e2f99f74-4111-4033-8eff-54073fbd4e32',
                project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
                type: 'content_item_variant',
                operation: 'publish',
                api_name: 'delivery_production',
                created_timestamp: '2019-07-18T15:07:17.6823904Z',
                webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732'
            }
        }
    }
};
