const handleErrors = require('./utils/handleErrors');

async function execute(z, bundle) {
    async function checkCmApi() {
        const options = {
            url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bundle.authData.cmApiKey}`,
            },
        };

        const response = await z.request(options);
        handleErrors(response);

        const info = z.JSON.parse(response.content);

        return info;
    }

    async function checkPreviewApi() {
        const options = {
            url: `https://preview-deliver.kontent.ai/${bundle.authData.projectId}/types`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bundle.authData.previewApiKey}`,
            },
        };

        const response = await z.request(options);
        handleErrors(response);

        return true;
    }

    async function checkConnection() {
        const projectInfo = checkCmApi();
        const previewApi = checkPreviewApi();

        const results = await Promise.all([
            projectInfo,
            previewApi,
        ]);

        return {
            projectName: results[0].name,
        };
    }

    const result = await checkConnection();

    return result;
}

const Authentication = {
    type: 'custom',
    test: execute,
    fields: [
        {
            label: 'Kentico Kontent Project ID',
            key: 'projectId',
            type: 'string',
            required: true,
            helpText: 'Your project ID is available in the [Kentico Kontent admin UI](https://app.kontent.ai) in Project Settings > API Keys.'
        },
        {
            label: 'Management API Key',
            key: 'cmApiKey',
            type: 'string',
            required: true,
            helpText: 'The Management API key is available in the [Kentico Kontent admin UI](https://app.kontent.ai) in Project Settings > API Keys.'
        },
        {
            label: 'Delivery Preview API Key',
            key: 'previewApiKey',
            type: 'string',
            required: true,
            helpText: 'The Preview API key is available in the [Kentico Kontent admin UI](https://app.kontent.ai) in Project Settings > API Keys.'
        },
        {
            label: 'Secure Access Key',
            key: 'secureApiKey',
            type: 'string',
            required: false,
            helpText: 'This is required for taxonomy steps if [Secure Access](https://docs.kontent.ai/tutorials/develop-apps/get-content/securing-public-access) is enabled in your project and is available in the [Kentico Kontent admin UI](https://app.kontent.ai) in Project Settings > API Keys.'
        }
    ],
    connectionLabel: '{{projectName}} - {{bundle.authData.projectId}}'
};

module.exports = Authentication;
