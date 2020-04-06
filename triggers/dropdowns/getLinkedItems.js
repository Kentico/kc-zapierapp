const handleErrors = require('../../utils/handleErrors');
const contentItemSample = require('../../fields/samples/contentItemSample');
const standardizedSystemOutputFields = require('../../fields/output/standardizedSystemOutputFields');

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

    const resultsWithId = results.map(
        (item) => Object.assign(
            item,
            {
                id: item.system.id
            }
        )
    );

    return resultsWithId;
}

module.exports = {
    noun: "Linked item",
    display: {
        hidden: true,
        important: false,
        description: "Gets content items for a linked items element ordered by name.",
        label: "Get Linked Items"
    },
    key: "get_linked_items",
    operation: {
        perform: execute,
        sample: contentItemSample,
        canPaginate: true,
        outputFields: standardizedSystemOutputFields,
    },
};
