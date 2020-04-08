const handleErrors = require('../handleErrors');

async function getLanguageByExternalId(z, bundle, externalId) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/languages/external-id/${externalId}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {}
    };

    const response = await z.request(options);
    handleErrors(response);

    const language = z.JSON.parse(response.content);

    return language;
}

module.exports = getLanguageByExternalId;
