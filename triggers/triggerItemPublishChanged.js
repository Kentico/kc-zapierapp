const getAdditionalItemOutputFields = require('../fields/output/getAdditionalItemOutputFields');
const contentItemSample = require('../fields/samples/contentItemSample');
const contentItemOutputFields = require('../fields/output/contentItemOutputFields');
const getContentTypeField = require('../fields/getContentTypeField');
const getLanguageField = require('../fields/getLanguageField');
const codeNameField = require('../fields/codeNameField');
const getSampleItemPublishPayload = require('../fields/samples/getSampleItemPublishPayload');
const getContentItem = require('../utils/items/get/getContentItem');
const getItemResult = require('../utils/items/get/getItemResult');
const getAllItems = require('../utils/items/get/getAllItems');
const getItemVariant = require('../utils/items/get/getItemVariant');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const getLanguage = require('../utils/languages/getLanguage');
const getLanguageByCodename = require('../utils/languages/getLanguageByCodename');
const makeHookItemOutput = require('./makeHookItemOutput');
const hookLabel = 'Variant published status changed';
const NUM_SAMPLE_ITEMS = 5;
const events = {
    publish: 'Publish',
    unpublish: 'Unpublish'
};

async function subscribeHook(z, bundle) {
    //If no events were selected, respond to all of them
    let watchedEvents = bundle.inputData.watchedEvents;
    if(!watchedEvents) watchedEvents = Object.keys(events);

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
    if(!hasValidSignature(z, bundle)){
        throw new Error('Unable to verify webhook signature.');
    }

    const items = bundle.cleanedRequest.data.items;
    const item = items[0];
    if (!item) {
        throw z.errors.HaltedError('Skipped, no items found.');
    }

    const targetLanguageId = bundle.inputData.languageId;
    if(targetLanguageId) {
        //language of POSTed item is a codename, get ID
        const language = await getLanguage(z, bundle, targetLanguageId);
        const languageCodename = language.codename;
        if (languageCodename && (item.language !== languageCodename)) {
            throw new z.errors.HaltedError('Skipped, language not matched.');
        }
    }

    const targetCodename = bundle.inputData.targetCodename;
    if (targetCodename && (item.codename !== targetCodename)) {
        throw new z.errors.HaltedError('Skipped, codename not matched.');
    }

    const language = await getLanguageByCodename(z, bundle, item.language);
    const resultItem = await getContentItem(z, bundle, item.id, language.id);
    if (!resultItem) {
        throw new z.errors.HaltedError('Skipped, item not found.');
    }

    const contentTypeId = bundle.inputData.contentTypeId;
    if (contentTypeId && (resultItem.system.contentTypeId !== contentTypeId)) {
        throw new z.errors.HaltedError('Skipped, content type not matched.');
    }

    return await makeHookItemOutput(z, bundle, [resultItem], () => { return bundle.cleanedRequest });
}

async function getFirstNItems(z, bundle, num) {
    let items = await getAllItems(z, bundle);
    if(!items) return null;

    //try to load item with codename
    const targetCodename = bundle.inputData.targetCodename;
    if(targetCodename) {
        const nameMatches = items.filter(i => i.codename === targetCodename);
        if(nameMatches.length > 0) {
            return [nameMatches[0]];
        }
    }

    //try to load item of the given type
    const contentTypeId = bundle.inputData.contentTypeId;
    if(contentTypeId) {
        const typeMatches = items.filter(i => i.type.id === contentTypeId);
        if(typeMatches.length > 0) {
            return typeMatches.slice(0, num);
        }
    }
    
    return items.slice(0, num);
}

async function getSampleItems(z, bundle) {
    let items = await getFirstNItems(z, bundle, NUM_SAMPLE_ITEMS);
    if (!items) {
        return [];
    }

    const promises = items.map(async item => {
        const variant = await getItemVariant(z, bundle, item.id);
        if(variant) {
            const sampleItem = await getItemResult(z, bundle, item, variant);
            return sampleItem;
        }
    });

    let resultItems = await Promise.all(promises);
    //remove content items that aren't translated
    resultItems = resultItems.filter(item => item != null);

    return await makeHookItemOutput(z, bundle, resultItems, getSampleItemPublishPayload);
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
            codeNameField,
            getLanguageField({
                helpText: 'Fires only for variants of the given languages. Leave blank for all languages.',
            }),
            getContentTypeField({
                helpText: 'Fires only for variants of the given content type. Leave blank for all content types.',
            }),
            getAdditionalItemOutputFields
        ],
        type: 'hook',

        performSubscribe: subscribeHook,
        performUnsubscribe: unsubscribeHook,

        perform: parsePayload,
        performList: getSampleItems,

        sample: contentItemSample,
        outputFields: contentItemOutputFields,
    }
};
