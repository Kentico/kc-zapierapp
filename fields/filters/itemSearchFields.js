const getContentTypeElements = require('../elements/getContentTypeElements');
const getOperatorChoices = require('./getOperatorChoices');
const { ElementsPrefix, SystemPrefix } = require ('../constants');

const searchInfo = {
    label: 'Search info',
    key: 'searchInfo',
    helpText: `### Search by field
    
You can search the item by a particular field value.`,
    type: 'copy',
};

async function getSearchField(z, bundle, contentTypeId) {
    //const elements = await getContentTypeElements(z, bundle, contentTypeId);
    const choices = [
        { value: 'id', sample: 'id', label: 'Item ID' },
        { value: 'externalId', sample: 'externalId', label: 'External ID' },
        { value: `${SystemPrefix}codename`, sample: `${SystemPrefix}codename`, label: 'Code name' }
    ];
    
    /*
    for (var i = 0; i < elements.length; i++) {
        const element = elements[i];
        if(element.type === 'guidelines') continue;

        switch (element.type) {
            case 'text':
            case 'custom':
            case 'url_slug':

            case 'multiple_choice':
            case 'modular_content':
            case 'taxonomy':

            case 'number':
                choices.push({
                    value: `${ElementsPrefix}${element.codename}`,
                    sample: `${ElementsPrefix}${element.codename}`,
                    label: element.name || element.codename
                });
        }
    }*/

    return [{
        label: 'Search field',
        key: 'searchField',
        helpText: 'Select the field based on which the item should be found.',
        required: true,
        choices,
        altersDynamicFields: true,
    }];
}

const searchField = async function (z, bundle) {
    return await getSearchField(z, bundle, bundle.inputData.contentTypeId);
};

async function getSearchOperator(z, bundle, contentTypeId, searchField) {
    const choices = await getOperatorChoices(z, bundle, contentTypeId, searchField);

    return [{
        label: 'Search operator',
        key: 'searchPattern',
        helpText: 'Select how the search value should be matched.',
        required: true,
        choices,
        default: choices[0].value,
        altersDynamicFields: true,
    }];
}

const searchOperator = async function (z, bundle) {
    return await getSearchOperator(z, bundle, bundle.inputData.contentTypeId, bundle.inputData.searchField);
};

const searchValue = {
    label: "Search value",
    key: "searchValue",
    helpText: "Value to match in the search field. The value must match exactly.",
    type: "string",
    required: true,
    altersDynamicFields: false
};

module.exports = [searchInfo, searchField, searchOperator, searchValue];
