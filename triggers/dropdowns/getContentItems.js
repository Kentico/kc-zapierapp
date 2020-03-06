const handleErrors = require('../../utils/handleErrors');
const contentItemSample = require('../../fields/samples/contentItemSample');
const standardizedSystemOutputFields = require('../../fields/standardizedSystemOutputFields');

async function execute(z, bundle) {
    const options = {
        url: `https://preview-deliver.kontent.ai/${bundle.authData.projectId}/items`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.previewApiKey}`
        },
        params: {
            'order': 'system.name[asc]',
            'depth': 0,
            'limit': 10,
            'skip': 10 * bundle.meta.page,
            'elements': '_' // Elements do not support empty value as "no elements" so we hack it like this
        }
    };

    const response = await z.request(options);
    handleErrors(response);

    const results = z.JSON.parse(response.content).items;

    // TODO - Standardize model
    const resultsWithId = results.map(
        (item) => Object.assign(
            item,
            {
                id: `${item.system.id}/${item.system.language}`
            }
        )
    );

    return resultsWithId;
}

module.exports = {
    noun: "Content item",
    display: {
        hidden: true,
        important: false,
        description: "Gets content items for the input dropdown ordered by name.",
        label: "Get Content Items"
    },
    key: "get_content_items",
    operation: {
        perform: execute,
        sample: contentItemSample,
        canPaginate: true,
        outputFields: standardizedSystemOutputFields,
    },
};
