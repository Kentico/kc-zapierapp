const getLanguageField = require('../fields/getLanguageField');
const getContentTypeField = require('../fields/getContentTypeField');
const getItemElementFields = require('../fields/elements/getItemElementFields');
const upsertVariant = require('../utils/items/update/upsertVariant');
const findItemByIdentifier = require('../utils/items/get/findItemByIdentifier');
const getItemResult = require('../utils/items/get/getItemResult');
const getVariant = require('../utils/items/get/getVariant');
const getWorkflowSteps = require('../utils/workflows/getWorkflowSteps');
const handleErrors = require('../utils/handleErrors');
const contentItemSample = require('../fields/samples/contentItemSample');
const contentItemOutputFields = require('../fields/output/contentItemOutputFields');
const itemSearchFields = require('../fields/filters/itemSearchFields');

const elementsInfoField = {
    label: "Elements",
    helpText: `#### Content item variant elements
                
The following inputs represent elements of a chosen content type as defined in Kentico Kontent. Element data is stored per language version.

[Read more about elements ...](https://docs.kontent.ai/tutorials/define-content-structure/content-elements/content-type-elements-reference)`,
    key: "elements_header",
    type: "copy",
};

async function execute(z, bundle) {
    const contentTypeId = bundle.inputData.contentTypeId;
    const languageId = bundle.inputData.languageId;
    const searchField = bundle.inputData.searchField;
    const searchValue = bundle.inputData.searchValue;

    // Check existing content item item, it may be available through the find action
    const existingItem = searchField && searchValue && await findItemByIdentifier(z, bundle, contentTypeId, searchField, searchValue);
    if(existingItem && existingItem.length > 0) {
        
        const existingVariant = await getVariant(z, bundle, existingItem[0].id, languageId);
        if(existingVariant) {
            return await tryUpdate(z, bundle, existingVariant, existingItem[0]);
        }
    }

    throw new z.errors.HaltedError('Skipped, language variant not found.');
}

function isPublishedWorkflowStep(stepId, workflowSteps) {
    const nextToLastStep = workflowSteps[workflowSteps.length - 2];

    return nextToLastStep && (nextToLastStep.id === stepId) && (nextToLastStep.name === "Published");
}

async function createNewVersion(z, bundle, itemId, languageId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}/new-version`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {},
    };

    const response = await z.request(options);
    handleErrors(response);
}

async function tryUpdate(z, bundle, variant, item) {
    const workflowSteps = await getWorkflowSteps(z, bundle);
    const currentStepId = variant.workflow_step.id;

    const isPublished = isPublishedWorkflowStep(currentStepId, workflowSteps);
    if (isPublished) {
        // Create new version first
        await createNewVersion(z, bundle, variant.item.id, variant.language.id);
    }

    result = await upsertVariant(z, bundle, item.id, variant.language.id, item.type.id);
    return await getItemResult(z, bundle, item, result, false);
}

const updateLanguageVariant = {
    noun: "Update language variant",
    display: {
        hidden: false,
        important: true,
        description: "Updates a language variant using Kontent Management API.",
        label: "Update Language Variant"
    },
    key: "update_variant",
    operation: {
        perform: execute,
        inputFields: [
            getLanguageField({ required: true }),
            getContentTypeField({ required: true, altersDynamicFields: true }),
            ...itemSearchFields,
            elementsInfoField,
            async function (z, bundle) {
                return await getItemElementFields(z, bundle, bundle.inputData.contentTypeId);
            }
        ],
        sample: contentItemSample,
        outputFields: contentItemOutputFields,
    },
};

module.exports = updateLanguageVariant;