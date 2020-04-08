const handleErrors = require('../handleErrors');

async function getAsset(z, bundle, assetId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/assets/${assetId}`,
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

module.exports = getAsset;
