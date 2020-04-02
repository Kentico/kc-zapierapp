const handleErrors = require('../../handleErrors');

async function getAllItemsDelivery(z, bundle) {
    const options = {
        url: `https://preview-deliver.kontent.ai/${bundle.authData.projectId}/items`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.previewApiKey}`
        }
    };

    const response = await z.request(options);
    handleErrors(response);

    return z.JSON.parse(response.content).items;
}

module.exports = getAllItemsDelivery;