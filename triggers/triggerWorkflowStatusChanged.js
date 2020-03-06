const getAdditionalItemOutputFields = require('../fields/getAdditionalItemOutputFields');
const contentItemSample = require('../fields/contentItemSample');
const contentItemOutputFields = require('../fields/contentItemOutputFields');
const getContentTypeField = require('../fields/getContentTypeField');
const getWorkflowStepField = require('../fields/getWorkflowStepField');
const getLanguageField = require('../fields/getLanguageField');
const getContentItem = require('../utils/items/get/getContentItem');
const getItemResult = require('../utils/items/get/getItemResult');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const makeHookItemOutput = require('./makeHookItemOutput');
const hookLabel = 'Content item workflow step changed';

async function subscribeHook(z, bundle) {
    const stepIDs = bundle.inputData.workflowStepIds.map(i => ({id: i}));
    const data = {
        // bundle.targetUrl has the Hook URL this app should call when a recipe is created.
        name: `${bundle.inputData.name || hookLabel} (Zapier)`,
        url: bundle.targetUrl,
        secret: getSecret(z, bundle),
        triggers: {
            workflow_step_changes: [
                {
                    type: 'content_item_variant',
                    transitions_to: stepIDs
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

    const languageId = bundle.inputData.languageId;
    if (languageId && (item.language.id !== languageId)) {
        throw new z.errors.HaltedError('Skipped, language not matched.');
    }

    const workflowStepIds = bundle.inputData.workflowStepIds;
    if (workflowStepIds && (!workflowStepIds.includes(item.transition_to.id))) {
        throw new z.errors.HaltedError('Skipped, target step not matched.');
    }

    const resultItem = await getContentItem(z, bundle, item.item.id, item.language.id);
    if (!resultItem) {
        throw new z.errors.HaltedError('Skipped, item not found.');
    }

    const contentTypeId = bundle.inputData.contentTypeId;
    if (contentTypeId && (resultItem.system.contentTypeId !== contentTypeId)) {
        throw new z.errors.HaltedError('Skipped, content type not matched.');
    }

    return await makeHookItemOutput(z, bundle, resultItem, 'management');
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

    let item = null;

    //try to load item of the given type
    const contentTypeId = bundle.inputData.contentTypeId;
    if(contentTypeId) {
        const typeMatches = items.filter(i => i.type.id === contentTypeId);
        if(typeMatches.length > 0) {
            item = typeMatches[0];
        }
        else item = items[0];
    }
    else item = items[0];

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

    return await makeHookItemOutput(z, bundle, sampleItem, 'management');
}

module.exports = {
    key: 'management_workflow_changed',
    noun: hookLabel,
    display: {
        label: hookLabel,
        description: 'Triggers when an item workflow step changes.'
    },
    operation: {
        inputFields: [
            {
                label: "Webhook name",
                helpText: "Enter a webhook name which will appear in the Kentico Kontent admin UI.",
                key: "name",
                type: "string",
            },
            getWorkflowStepField({
                required: true,
                list: true,
                helpText: 'Fires for the selected workflow steps.',
            }),
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
