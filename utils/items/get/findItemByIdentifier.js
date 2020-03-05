const getItem = require('./getItem');

function getCmApiItemUrl(bundle, searchField, searchValue) {
    if (!searchValue) {
        throw new Error(`Missing search value for ${searchField}`);
    }

    switch (searchField) {
        case 'externalId':
            return `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/external-id/${searchValue}`;

        case 'id':
            return `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${searchValue}`;

        case 'system.codename':
            return `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/codename/${searchValue}`;

        default:
            return null;
    }
}

async function findItemByIdentifier(z, bundle, contentTypeId, searchField, searchValue) {
    const cmApiItemUrl = getCmApiItemUrl(bundle, searchField, searchValue);
    if (!cmApiItemUrl) {
        return null;
    }

    const item = await getItem(z, bundle, cmApiItemUrl);
    if (!item) {
        return [];
    }

    // Validate content type
    if (contentTypeId && (item.type.id !== contentTypeId)) {
        return [];
    }

    return [item];
}

module.exports = findItemByIdentifier;
