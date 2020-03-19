const handleErrors = require('../../handleErrors');
async function getAllItems(z, bundle) {
    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/items`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
    };

    const response = await z.request(options);
    handleErrors(response);

    const items = z.JSON.parse(response.content).items;
    if (!items.length) {
        return null;
    }

    return items;
}

module.exports = getAllItems;