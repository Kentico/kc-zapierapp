const handleErrors = require('../../handleErrors');
const getElementsForUpsert = require('../../elements/getElementsForUpsert');

async function updateVariant(z, bundle, itemId, languageId, contentTypeId) {
    const elements = await getElementsForUpsert(z, bundle, contentTypeId);

    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {},
        body: {
            elements,
        }
    };

    const variantResponse = await z.request(options);
    handleErrors(variantResponse);

    const variant = z.JSON.parse(variantResponse.content);

    return variant;
}

module.exports = updateVariant;