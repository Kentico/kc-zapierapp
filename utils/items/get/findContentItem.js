const getFilterParams = require('./getFilterParams');
const handleErrors = require('../../handleErrors');
const getVariant = require('./getVariant');
const getItemResult = require('./getItemResult');
const getContentItem = require('./getContentItem');
const findItemByIdentifier = require('./findItemByIdentifier');

async function findContentItemByIdentifier(z, bundle, languageId, searchField, searchValue) {
    const item = await findItemByIdentifier(z, bundle, null, searchField, searchValue);
    if (!item) {
        // Cannot search
        return null;
    }

    if (!item.length) {
        // Not found
        return [];
    }

    const itemId = item[0].id;

    const variant = await getVariant(z, bundle, itemId, languageId);
    if (!variant) {
        // Not found
        return [];
    }

    // Found
    const contentItem = await getItemResult(z, bundle, item[0], variant);

    return [contentItem];
}

async function findContentItem(z, bundle, languageId, searchField, searchPattern, searchValue) {
    const foundByCmApi = await findContentItemByIdentifier(z, bundle, languageId, searchField, searchValue);
    if (foundByCmApi) {
        // Could search by identifier
        return foundByCmApi;
    }
    
    return null;
}

module.exports = findContentItem;
