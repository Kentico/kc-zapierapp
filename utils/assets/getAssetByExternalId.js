const handleErrors = require('../handleErrors');

async function getAssetByExternalId(z, bundle, externalId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/assets/external-id/${externalId}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {}
    };

    const response = await z.request(options);
    handleErrors(response);

    const asset = z.JSON.parse(response.content);

    return asset;
}

module.exports = getAssetByExternalId;
