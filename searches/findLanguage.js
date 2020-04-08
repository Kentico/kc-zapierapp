const languageSearchFields = require('../fields/filters/languageSearchFields');
const getLanguage = require('../utils/languages/getLanguage');
const getLanguageByCodename = require('../utils/languages/getLanguageByCodename');
const getLanguageByExternalId = require('../utils/languages/getLanguageByExternalId');

async function execute(z, bundle) {
    const searchField = bundle.inputData.searchField;
    const searchPattern = bundle.inputData.searchPattern;
    const searchValue = bundle.inputData.searchValue;

    let found;
    switch(searchField) {
        case 'id':
            found = await getLanguage(z, bundle, searchValue);
            break;
        case 'codename':
            found = await getLanguageByCodename(z, bundle, searchValue);
            break;
        case 'externalId':
            found = await getLanguageByExternalId(z, bundle, searchValue);
            break;
    }

    return [found];
}

const findLanguage = {
    noun: 'Language search',
    display: {
        hidden: false,
        important: false,
        description: 'Finds a language based on its ID, code name, or external ID.',
        label: 'Find Language',
    },
    key: 'find_language',
    operation: {
        perform: execute,
        inputFields: [
            ...languageSearchFields
        ],
        sample: {
            id: '1c37a40c-9158-031d-9d2d-adf65a568cd6',
            name: 'Czech',
            codename: 'cz-CZ',
            external_id: 'lang_czech',
            is_active: true,
            is_default: false,
            fallback_language: {
              id: '00000000-0000-0000-0000-000000000000'
            }
        },
    },
};

module.exports = findLanguage;
