const handleErrors = require('../../handleErrors');

async function getTaxonomyGroupRaw(z, bundle, codename) {
    const options = {
        url: `https://deliver.kontent.ai/${bundle.authData.projectId}/taxonomies/${codename}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if(bundle.authData.secureApiKey) {
        options.headers['Authorization'] = `Bearer ${bundle.authData.secureApiKey}`;
    }

    const response = await z.request(options);
    handleErrors(response);

    return response.content
}

module.exports = getTaxonomyGroupRaw;