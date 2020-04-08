const assetSearchFields = require('../fields/filters/assetSearchFields');
const assetOutputFields = require('../fields/output/assetOutputFields');
const getAsset = require('../utils/assets/getAsset');
const getAssetByExternalId = require('../utils/assets/getAssetByExternalId');

async function execute(z, bundle) {
    let found;

    const searchField = bundle.inputData.searchField;
    const searchPattern = bundle.inputData.searchPattern;
    const searchValue = bundle.inputData.searchValue;

    switch(searchField) {
        case 'id':
            found = await getAsset(z, bundle, searchValue);
            break;
        case 'externalId':
            found = await getAssetByExternalId(z, bundle, searchValue);
            break;
    }

    return [found];
}

const findAsset = {
    noun: 'Asset search',
    display: {
        hidden: false,
        important: false,
        description: 'Finds an asset based on its ID or external ID',
        label: 'Find Asset',
    },
    key: 'find_asset',
    operation: {
        perform: execute,
        inputFields: [
            ...assetSearchFields
        ],
        outputFields: [
            ...assetOutputFields
        ],
    },
};

module.exports = findAsset;
