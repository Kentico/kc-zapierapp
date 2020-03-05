const handleErrors = require('../utils/handleErrors');

async function unsubscribeHook(z, bundle) {
    // bundle.subscribeData contains the parsed response JSON from the subscribe
    // request made initially.
    const webhook = bundle.subscribeData;

    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/webhooks/${webhook.id}`,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
    };

    const response = await z.request(options);
    handleErrors(response);

    return true;
}

module.exports = unsubscribeHook;