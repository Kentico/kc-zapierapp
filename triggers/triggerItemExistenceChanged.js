const getAdditionalItemOutputFields = require('../fields/getAdditionalItemOutputFields');
const contentItemSample = require('../fields/samples/contentItemSample');
const contentItemOutputFields = require('../fields/contentItemOutputFields');
const getContentTypeField = require('../fields/getContentTypeField');
const getLanguageField = require('../fields/getLanguageField');
const getSampleItemExistencePayload = require('../fields/samples/getSampleItemExistencePayload');
const getContentItem = require('../utils/items/get/getContentItem');
const getItemResult = require('../utils/items/get/getItemResult');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const getLanguage = require('../utils/languages/getLanguage');
const getLanguageByCodename = require('../utils/languages/getLanguageByCodename');
const makeHookItemOutput = require('./makeHookItemOutput');
const hookLabel = 'Language variant created, deleted or restored';
const events = {
    create: 'Create',
    archive: 'Delete',
    restore: 'Restore'
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
        const languageCodename = await getLanguage(z, bundle, targetLanguageId).codename;
        if (languageCodename && (item.language !== languageCodename)) {
            throw new z.errors.HaltedError('Skipped, language not matched.');
        }
    }

    const targetCodename = bundle.inputData.targetCodename;
    if (targetCodename && (item.codename !== targetCodename)) {
        throw new z.errors.HaltedError('Skipped, codename not matched.');
    }

    //If responding to an 'archive' operation, variant isn't available anymore
    if(bundle.cleanedRequest.message.operation === 'archive') {
        return await makeHookItemOutput(z, bundle, null, () => { return bundle.cleanedRequest; });
    }
    else {
        const language = await getLanguageByCodename(z, bundle, item.language);
        const resultItem = await getContentItem(z, bundle, item.id, language.id);
        if (!resultItem) {
            throw new z.errors.HaltedError('Skipped, item not found.');
        }

        const contentTypeId = bundle.inputData.contentTypeId;
        if (contentTypeId && (resultItem.system.contentTypeId !== contentTypeId)) {
            throw new z.errors.HaltedError('Skipped, content type not matched.');
        }

        return await makeHookItemOutput(z, bundle, resultItem, () => { return bundle.cleanedRequest; });
    }
}

async function getFirstFoundItem(z, bundle) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
    };

    const response = await z.request(options);
    handleErrors(response);

    const items = z.JSON.parse(response.content).items;
    if (!items.length) {
        return null;
    }

    let item = items[0];

    //try to load item with codename
    const targetCodename = bundle.inputData.targetCodename;
    if(targetCodename) {
        const nameMatches = items.filter(i => i.codename === targetCodename);
        if(nameMatches.length > 0) {
            item = nameMatches[0];
        }
    }
    else {
        //try to load item of the given type
        const contentTypeId = bundle.inputData.contentTypeId;
        if(contentTypeId) {
            const typeMatches = items.filter(i => i.type.id === contentTypeId);
            if(typeMatches.length > 0) {
                item = typeMatches[0];
            }
        }
    }

    return item;
}

async function getItemVariants(z, bundle, itemId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
    };

    const response = await z.request(options);
    handleErrors(response);

    const variants = z.JSON.parse(response.content);
    return variants;
}


async function getSampleItem(z, bundle) {
    const item = await getFirstFoundItem(z, bundle);
    if (!item) {
        return [];
    }

    const variants = await getItemVariants(z, bundle, item.id);
    if (!variants.length) {
        return [];
    }

    const sampleItem = await getItemResult(z, bundle, item, variants[0]);

    return await makeHookItemOutput(z, bundle, sampleItem, getSampleItemExistencePayload);
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
            {
                label: 'Content item code name',
                helpText: 'Fires only for the item of the give code name. Leave blank for all content items.',
                key: 'targetCodename',
                type: 'string'
            },
            getLanguageField({
                helpText: 'Fires only for items of the given languages. Leave blank for all languages.',
            }),
            getContentTypeField({
                helpText: 'Fires only for items of the given content type. Leave blank for all content types.',
            }),
            getAdditionalItemOutputFields
        ],
        type: 'hook',

        performSubscribe: subscribeHook,
        performUnsubscribe: unsubscribeHook,

        perform: parsePayload,
        performList: getSampleItem,

        sample: contentItemSample,
        outputFields: contentItemOutputFields,
    }
};
