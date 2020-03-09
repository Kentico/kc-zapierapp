const handleErrors = require('../../handleErrors');

async function deleteVariant(z, bundle, itemId, languageId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items/${itemId}/variants/${languageId}`,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
    };

    const response = await z.request(options);
    handleErrors(response);

    return response.status;
}

module.exports = deleteVariant;