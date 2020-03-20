const getLanguageField = require('../fields/getLanguageField');
const getContentTypeField = require('../fields/getContentTypeField');
const getItemElementFields = require('../fields/elements/getItemElementFields');
const upsertVariant = require('../utils/items/update/upsertVariant');
const findItemByIdentifier = require('../utils/items/get/findItemByIdentifier');
const getItemResult = require('../utils/items/get/getItemResult');
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
        const variant = await upsertVariant(z, bundle, existingItem[0].id, languageId, contentTypeId);
        return getItemResult(z, bundle, existingItem[0], variant);
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
        description: "Updates a language variant using Kontent Management API, or creates it if it doesn't exist.",
        label: "Update language variant"
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