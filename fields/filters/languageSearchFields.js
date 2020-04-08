//const getOperatorChoices = require('./getOperatorChoices');

const searchInfo = async function(z, bundle) {
    return {
        label: 'Search info',
        key: 'searchInfo',
        helpText: `### Search by value
        
    You can search for the language based on several values.`,
        type: 'copy',
    };
};

const searchField = async function (z, bundle) {
    const choices = [
        { value: 'id', sample: 'id', label: 'Language ID' },
        { value: 'externalId', sample: 'externalId', label: 'External ID' },
        { value: 'codename', sample: `codename`, label: 'Code name' }
    ];
    
    return [{
        label: 'Search field',
        key: 'searchField',
        helpText: 'Select the field based on which the language should be found.',
        required: true,
        choices,
        altersDynamicFields: true,
    }];
};

const searchOperator = async function (z, bundle) {
    const choices = [
        { value: '{0}={1}', sample: '{0}={1}', label: 'Equals' },
    ]; //await getOperatorChoices(z, bundle, contentTypeId, searchField); - TODO allow other operators

    return [{
        label: 'Search operator',
        key: 'searchPattern',
        helpText: 'Select how the search value should be matched.',
        required: true,
        choices,
        default: choices[0].value,
        altersDynamicFields: true,
    }];
};

const searchValue = async function (z, bundle) {
    return {
        label: "Search value",
        key: "searchValue",
        helpText: "Value to match in the search field. The value must match exactly.",
        type: "string",
        required: true,
        altersDynamicFields: false
    }
};

module.exports = [searchInfo, searchField, searchOperator, searchValue];
