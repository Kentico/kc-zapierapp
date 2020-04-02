const contentItemSample = require('../fields/samples/contentItemSample');
const contentItemOutputFields = require('../fields/output/contentItemOutputFields');
const getWorkflowStepField = require('../fields/getWorkflowStepField');
const getLanguageField = require('../fields/getLanguageField');
const getSampleWorkflowPayload = require('../fields/samples/getSampleWorkflowPayload');
const getTriggerSampleOutput = require('../fields/samples/getTriggerSampleOutput');
const getContentTypeFieldForSamples = require('../fields/getContentTypeFieldForSamples');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const makeHookItemOutput = require('./makeHookItemOutput');
const hookLabel = 'Variant Workflow Step Changed';

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

    return await makeHookItemOutput(z, bundle, [item], () => { return bundle.cleanedRequest; });
}

module.exports = {
    key: 'management_workflow_changed',
    noun: hookLabel,
    display: {
        important: true,
        label: hookLabel,
        description: 'Triggers when a language variant workflow step changes.'
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
                helpText: 'Fires only for variants of the given languages. Leave blank for all languages.',
            }),
            getContentTypeFieldForSamples
        ],
        type: 'hook',

        performSubscribe: subscribeHook,
        performUnsubscribe: unsubscribeHook,

        perform: parsePayload,
        performList: (z, bundle) => { return getTriggerSampleOutput(z, bundle, getSampleWorkflowPayload) },
    }
};
