const getLanguageField = require('../fields/getLanguageField');
const findItemByIdentifier = require('../utils/items/get/findItemByIdentifier');
const contentItemSample = require('../fields/samples/contentItemSample');
const contentItemOutputFields = require('../fields/output/contentItemOutputFields');
const itemSearchFields = require('../fields/filters/itemSearchFields');
const deleteVariant = require('../utils/items/delete/deleteVariant');

async function execute(z, bundle) {
    const languageId = bundle.inputData.languageId;
    const searchField = bundle.inputData.searchField;
    const searchValue = bundle.inputData.searchValue;

    // Check existing content item item, it may be available through the find action
    const existingItem = searchField && searchValue && await findItemByIdentifier(z, bundle, null, searchField, searchValue);
    if(existingItem && existingItem.length > 0) {
        const statusCode = await deleteVariant(z, bundle, existingItem[0].id, languageId);
        if(statusCode !== 204) {
            throw new z.errors.HaltedError(`Skipped, Kontent responded with ${statusCode}.`)
        }
        else return existingItem[0];
    }
    else {
        throw new z.errors.HaltedError('Skipped, language variant not found.');
    }
}

const deleteLanguageVariant = {
    noun: "Delete language variant",
    display: {
        hidden: false,
        important: false,
        description: "Deletes an existing language variant using Kontent Management API.",
        label: "Delete Language Variant"
    },
    key: "delete_variant",
    operation: {
        perform: execute,
        inputFields: [
            getLanguageField({ required: true }),
            ...itemSearchFields,
        ],
        sample: contentItemSample,
        outputFields: contentItemOutputFields,
    },
};

module.exports = deleteLanguageVariant;