const handleErrors = require('../../handleErrors');

async function getContentItemRaw(z, bundle, itemCodeName, languageCodename) {
    const options = {
        url: `https://preview-deliver.kontent.ai/${bundle.authData.projectId}/items/${itemCodeName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.previewApiKey}`
        },
        params: {
            language: languageCodename
        }
    };

    const response = await z.request(options);
    handleErrors(response);

    return response.content
}

module.exports = getContentItemRaw;
