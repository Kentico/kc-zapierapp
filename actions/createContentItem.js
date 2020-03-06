const getLanguageField = require('../fields/getLanguageField');
const getContentTypeField = require('../fields/getContentTypeField');
const getItemElementFields = require('../fields/elements/getItemElementFields');
const createItem = require('../utils/items/create/createItem');
const createVariant = require('../utils/items/create/createVariant');
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
    const name = bundle.inputData.name;
    const contentTypeId = bundle.inputData.contentTypeId;
    const languageId = bundle.inputData.languageId;
    const externalId = bundle.inputData.externalId;

    const item = await createItem(z, bundle, name, contentTypeId, externalId);
    const variant = await createVariant(z, bundle, item.id, languageId, contentTypeId);
    const result = getItemResult(z, bundle, item, variant);

    return result;
}

const createContentItem = {
    noun: "New content item",
    display: {
        hidden: false,
        important: true,
        description: "Creates a content item and language variant using Kontent Management API. The created item is not published, but only in the Draft workflow step.",
        label: "Create content item"
    },
    key: "create_item",
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

module.exports = createContentItem;
