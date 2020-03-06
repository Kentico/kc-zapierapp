const getLanguageField = require('../fields/getLanguageField');
const getContentTypeField = require('../fields/getContentTypeField');
const getItemElementFields = require('../fields/elements/getItemElementFields');
const updateVariant = require('../utils/items/update/updateVariant');
const findItemByIdentifier = require('../utils/items/get/findItemByIdentifier');
const getItemResult = require('../utils/items/get/getItemResult');
const contentItemSample = require('../fields/samples/contentItemSample');
const contentItemOutputFields = require('../fields/contentItemOutputFields');

const itemNameField = {
    required: true,
    label: "Content item name",
    helpText: "Name of the content item. Displays in content inventory. Shared by all language variants.",
    key: "name",
    type: "string",
};

const externalIdField = {
    required: false,
    label: "External ID",
    helpText: "Any unique identifier for the item in the external system. Can be used to link the content item for future updates. [Read more about external ID ...](https://developer.kontent.ai/v1/reference#content-management-api-reference-by-external-id)",
    key: "externalId",
    type: "string",
};

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
        const variant = await updateVariant(z, bundle, existingItem[0].id, languageId, contentTypeId);
        return getItemResult(z, bundle, item, variant);
    }
    else {
        throw new z.errors.HaltedError('Skipped, language variant not found.');
    }
}

const updateLanguageVariant = {
    noun: "Update language variant",
    display: {
        hidden: false,
        important: true,
        description: "Updates an existing language variant using Kontent Management API.",
        label: "Update language variant"
    },
    key: "update_variant",
    operation: {
        perform: execute,
        inputFields: [
            getLanguageField({ required: true }),
            getContentTypeField({ required: true, altersDynamicFields: true }),
            itemNameField,
            externalIdField,
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